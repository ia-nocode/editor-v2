import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchEnrollments, enrollUser, unenrollUser } from '../services/enrollment';
import EnrollmentList from './EnrollmentList';
import EnrollmentModal from './EnrollmentModal';
import LoadingSpinner from './LoadingSpinner';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Course } from '../types/course';
import type { EnrollmentWithUserDetails } from '../types/enrollment';

interface EnrollmentManagerProps {
  course: Course;
  onBack: () => void;
}

export default function EnrollmentManager({ course, onBack }: EnrollmentManagerProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithUserDetails[]>([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithUserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, [course.id]);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const data = await fetchEnrollments(course.id);
      setEnrollments(data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Échec du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (userId: string) => {
    try {
      await enrollUser(course.id, userId);
      toast.success('Étudiant inscrit avec succès');
      await loadEnrollments();
      setIsEnrollModalOpen(false);
    } catch (error: any) {
      console.error('Error enrolling user:', error);
      toast.error(error.message || 'Échec de l\'inscription');
    }
  };

  const handleUnenrollClick = (enrollment: EnrollmentWithUserDetails) => {
    setSelectedEnrollment(enrollment);
    setIsDeleteModalOpen(true);
  };

  const handleUnenrollConfirm = async () => {
    if (!selectedEnrollment) return;

    try {
      await unenrollUser(selectedEnrollment.id);
      toast.success('Étudiant désinscrit avec succès');
      await loadEnrollments();
      setIsDeleteModalOpen(false);
      setSelectedEnrollment(null);
    } catch (error) {
      console.error('Error unenrolling user:', error);
      toast.error('Échec de la désinscription');
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
              {course.title} - Inscriptions
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Inscrire des étudiants
            </button>
          </div>

          <EnrollmentList
            enrollments={enrollments}
            onUnenroll={handleUnenrollClick}
          />

          <EnrollmentModal
            isOpen={isEnrollModalOpen}
            courseId={course.id}
            onClose={() => setIsEnrollModalOpen(false)}
            onEnroll={handleEnroll}
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            itemType="enrollment"
            title={`${selectedEnrollment?.userDetails.firstName} ${selectedEnrollment?.userDetails.lastName}`}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedEnrollment(null);
            }}
            onConfirm={handleUnenrollConfirm}
          />
        </div>
      </main>
    </div>
  );
}