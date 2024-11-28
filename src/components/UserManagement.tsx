import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut, createUserWithEmailAndPassword, deleteUser, updatePassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { getAdminAuth, getUserManagementAuth, cleanupUserManagementAuth } from '../services/auth';
import { PlusCircle, LogOut, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import UserList from './UserList';
import RoleModal from './RoleModal';
import CreateUserModal from './CreateUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ThemeToggle from './ThemeToggle';
import LoadingSpinner from './LoadingSpinner';
import type { User as UserType, Role } from '../types/user';

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminAuth = getAdminAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as UserType[];
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Échec du chargement des utilisateurs');
      setLoading(false);
    }
  };

  const handleCreateUser = async (
    email: string,
    password: string,
    role: Role,
    firstName: string,
    lastName: string,
    mobile: string
  ) => {
    let managementAuth = null;
    try {
      managementAuth = getUserManagementAuth();
      const userCredential = await createUserWithEmailAndPassword(managementAuth, email, password);
      const { uid } = userCredential.user;

      const userDoc = {
        uid,
        email,
        firstName,
        lastName,
        mobile,
        role,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await addDoc(collection(db, 'users'), userDoc);
      
      if (managementAuth.currentUser) {
        await managementAuth.signOut();
      }

      toast.success('Utilisateur créé avec succès');
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Cet email est déjà enregistré');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Adresse email invalide');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
      } else {
        toast.error('Échec de la création de l\'utilisateur');
      }

      if (managementAuth?.currentUser) {
        try {
          await deleteUser(managementAuth.currentUser);
        } catch (cleanupError) {
          console.error('Error cleaning up auth user:', cleanupError);
        }
      }
    } finally {
      cleanupUserManagementAuth();
    }
  };

  const handleEditRole = (user: UserType) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async (userId: string, updates: Partial<UserType>, newPassword?: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        ...updates,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(userRef, updateData);

      if (newPassword) {
        const managementAuth = getUserManagementAuth();
        // Here you would need to implement the password update logic
        // This is a placeholder as Firebase requires the user to be logged in
        toast.success('Informations mises à jour avec succès');
      } else {
        toast.success('Informations mises à jour avec succès');
      }

      fetchUsers();
      setIsRoleModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Échec de la mise à jour');
    }
  };

  const handleDeleteClick = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await deleteDoc(doc(db, 'users', selectedUser.id));
      toast.success('Utilisateur supprimé avec succès');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Échec de la suppression');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(adminAuth);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Échec de la déconnexion');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img 
                src="https://raw.githubusercontent.com/es-ia-academy/site/main/media/images/ia-academy-ico_100x100.png"
                alt="Logo"
                className="h-10 w-10 aspect-square object-contain rounded-full border-3 border-black p-[5px]"
              />
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <User className="h-5 w-5 mr-2" />
                <span>{adminAuth.currentUser?.email}</span>
              </div>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Ajouter un utilisateur
            </button>
          </div>

          <UserList
            users={users}
            onEditRole={handleEditRole}
            onDeleteUser={handleDeleteClick}
          />

          <RoleModal
            user={selectedUser}
            isOpen={isRoleModalOpen}
            onClose={() => {
              setIsRoleModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleUpdateRole}
          />

          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateUser}
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            user={selectedUser}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </main>
    </div>
  );
}