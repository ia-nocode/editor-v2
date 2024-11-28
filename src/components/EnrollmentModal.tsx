import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, UserPlus } from 'lucide-react';
import type { User } from '../types/user';

interface EnrollmentModalProps {
  isOpen: boolean;
  courseId: string;
  onClose: () => void;
  onEnroll: (userId: string) => Promise<void>;
}

export default function EnrollmentModal({ isOpen, courseId, onClose, onEnroll }: EnrollmentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolledUsers, setEnrolledUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchEnrolledUsers();
    }
  }, [isOpen, courseId]);

  const fetchEnrolledUsers = async () => {
    try {
      const enrollmentsRef = collection(db, 'enrolled');
      const q = query(enrollmentsRef, where('courseId', '==', courseId));
      const snapshot = await getDocs(q);
      const enrolledUserIds = snapshot.docs.map(doc => doc.data().userId);
      setEnrolledUsers(enrolledUserIds);
    } catch (error) {
      console.error('Error fetching enrolled users:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Simplified query to only filter by role
      const q = query(usersRef, where('role', '==', 'user'));
      const snapshot = await getDocs(q);
      
      // Client-side filtering for email
      const searchTermLower = searchTerm.toLowerCase();
      const usersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as User)
        .filter(user => 
          user.email.toLowerCase().includes(searchTermLower) ||
          user.firstName.toLowerCase().includes(searchTermLower) ||
          user.lastName.toLowerCase().includes(searchTermLower)
        );

      setUsers(usersData);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Inscrire des étudiants
        </h2>

        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par email, prénom ou nom"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              onClick={searchUsers}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={() => onEnroll(user.id)}
                disabled={enrolledUsers.includes(user.id)}
                className="flex items-center px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {enrolledUsers.includes(user.id) ? 'Inscrit' : 'Inscrire'}
              </button>
            </div>
          ))}
          {users.length === 0 && !loading && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              Aucun utilisateur trouvé
            </p>
          )}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}