import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db } from '../lib/firebase';
import { getAdminAuth } from '../services/auth';
import { PlusCircle, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CourseList from './CourseList';
import CourseModal from './CourseModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import LessonManager from './LessonManager';
import EnrollmentManager from './EnrollmentManager';
import ThemeToggle from './ThemeToggle';
import LoadingSpinner from './LoadingSpinner';
import type { Course, CourseFormData } from '../types/course';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [selectedCourseForEnrollments, setSelectedCourseForEnrollments] = useState<Course | null>(null);
  const adminAuth = getAdminAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesCollection = collection(db, 'courses');
      const snapshot = await getDocs(coursesCollection);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as Course[];
      setCourses(coursesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Échec du chargement des cours');
      setLoading(false);
    }
  };

  const handleCreateCourse = async (data: CourseFormData) => {
    try {
      const courseDoc = {
        ...data,
        teacherId: adminAuth.currentUser?.uid,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await addDoc(collection(db, 'courses'), courseDoc);
      toast.success('Cours créé avec succès');
      setIsCourseModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Échec de la création du cours');
    }
  };

  const handleUpdateCourse = async (courseId: string, data: CourseFormData) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const updateData = {
        ...data,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(courseRef, updateData);
      toast.success('Cours mis à jour avec succès');
      setIsCourseModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Échec de la mise à jour');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      await deleteDoc(doc(db, 'courses', selectedCourse.id));
      toast.success('Cours supprimé avec succès');
      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
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

  if (selectedCourseForLessons) {
    return (
      <LessonManager
        course={selectedCourseForLessons}
        onBack={() => setSelectedCourseForLessons(null)}
      />
    );
  }

  if (selectedCourseForEnrollments) {
    return (
      <EnrollmentManager
        course={selectedCourseForEnrollments}
        onBack={() => setSelectedCourseForEnrollments(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestion des cours
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
              onClick={() => {
                setSelectedCourse(null);
                setIsCourseModalOpen(true);
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Ajouter un cours
            </button>
          </div>

          <CourseList
            courses={courses}
            onEditCourse={(course) => {
              setSelectedCourse(course);
              setIsCourseModalOpen(true);
            }}
            onDeleteCourse={(course) => {
              setSelectedCourse(course);
              setIsDeleteModalOpen(true);
            }}
            onManageLessons={setSelectedCourseForLessons}
            onManageEnrollments={setSelectedCourseForEnrollments}
          />

          <CourseModal
            course={selectedCourse}
            isOpen={isCourseModalOpen}
            onClose={() => {
              setIsCourseModalOpen(false);
              setSelectedCourse(null);
            }}
            onSave={selectedCourse ? 
              (data) => handleUpdateCourse(selectedCourse.id, data) :
              handleCreateCourse
            }
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            itemType="course"
            title={selectedCourse?.title || ''}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedCourse(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </main>
    </div>
  );
}