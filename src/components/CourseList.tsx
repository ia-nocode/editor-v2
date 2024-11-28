import React from 'react';
import { Trash2, Edit, Layers, Users } from 'lucide-react';
import type { Course } from '../types/course';

interface CourseListProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onManageLessons: (course: Course) => void;
  onManageEnrollments: (course: Course) => void;
}

export default function CourseList({
  courses,
  onEditCourse,
  onDeleteCourse,
  onManageLessons,
  onManageEnrollments
}: CourseListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
              }}
            />
          </div>
          <div className="p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {course.description}
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onManageEnrollments(course)}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                title="Gérer les inscriptions"
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={() => onManageLessons(course)}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                title="Gérer les leçons"
              >
                <Layers className="h-5 w-5" />
              </button>
              <button
                onClick={() => onEditCourse(course)}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                title="Modifier le cours"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDeleteCourse(course)}
                className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                title="Supprimer le cours"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}