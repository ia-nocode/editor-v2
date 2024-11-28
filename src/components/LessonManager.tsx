import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LessonList from './LessonList';
import LessonModal from './LessonModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import LoadingSpinner from './LoadingSpinner';
import type { Course } from '../types/course';
import type { Lesson, LessonFormData } from '../types/lesson';

interface LessonManagerProps {
  course: Course;
  onBack: () => void;
}

export default function LessonManager({ course, onBack }: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [course.id]);

  const fetchLessons = async () => {
    try {
      const lessonsCollection = collection(db, 'lessons');
      const q = query(lessonsCollection, where('courseId', '==', course.id));
      const snapshot = await getDocs(q);
      const lessonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as Lesson[];
      setLessons(lessonsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Échec du chargement des leçons');
      setLoading(false);
    }
  };

  const handleCreateLesson = async (data: LessonFormData) => {
    try {
      const lessonDoc = {
        ...data,
        courseId: course.id,
        order: lessons.length,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await addDoc(collection(db, 'lessons'), lessonDoc);
      toast.success('Leçon créée avec succès');
      setIsLessonModalOpen(false);
      fetchLessons();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Échec de la création de la leçon');
    }
  };

  const handleUpdateLesson = async (lessonId: string, data: LessonFormData) => {
    try {
      const lessonRef = doc(db, 'lessons', lessonId);
      const updateData = {
        ...data,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(lessonRef, updateData);
      toast.success('Leçon mise à jour avec succès');
      setIsLessonModalOpen(false);
      fetchLessons();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Échec de la mise à jour');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLesson) return;

    try {
      await deleteDoc(doc(db, 'lessons', selectedLesson.id));
      toast.success('Leçon supprimée avec succès');
      setIsDeleteModalOpen(false);
      setSelectedLesson(null);
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Échec de la suppression');
    }
  };

  const handleReorderLessons = async (reorderedLessons: Lesson[]) => {
    try {
      const batch = writeBatch(db);
      
      reorderedLessons.forEach((lesson) => {
        const lessonRef = doc(db, 'lessons', lesson.id);
        batch.update(lessonRef, { 
          order: lesson.order,
          lastUpdated: serverTimestamp()
        });
      });

      await batch.commit();
      setLessons(reorderedLessons);
      toast.success('Ordre des leçons mis à jour');
    } catch (error) {
      console.error('Error reordering lessons:', error);
      toast.error('Échec de la mise à jour de l\'ordre');
      fetchLessons(); // Refresh to restore original order
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour aux cours
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {course.title} - Leçons
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setSelectedLesson(null);
                setIsLessonModalOpen(true);
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Ajouter une leçon
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Aucune leçon. Cliquez sur "Ajouter une leçon" pour en créer une.
              </p>
            </div>
          ) : (
            <LessonList
              lessons={lessons}
              onEditLesson={(lesson) => {
                setSelectedLesson(lesson);
                setIsLessonModalOpen(true);
              }}
              onDeleteLesson={(lesson) => {
                setSelectedLesson(lesson);
                setIsDeleteModalOpen(true);
              }}
              onReorderLessons={handleReorderLessons}
            />
          )}

          <LessonModal
            lesson={selectedLesson}
            isOpen={isLessonModalOpen}
            onClose={() => {
              setIsLessonModalOpen(false);
              setSelectedLesson(null);
            }}
            onSave={selectedLesson ? 
              (data) => handleUpdateLesson(selectedLesson.id, data) :
              handleCreateLesson
            }
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            itemType="lesson"
            title={selectedLesson?.title || ''}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedLesson(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </main>
    </div>
  );
}