import React, { useState, useEffect } from 'react';
import type { Lesson, LessonFormData } from '../types/lesson';

interface LessonModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LessonFormData) => void;
}

const labels = {
  title: 'Titre',
  content: 'Contenu',
  videoUrl: 'URL de la vidéo (optionnel)',
  videoUrlPlaceholder: 'https://exemple.com/video.mp4',
  videoUrlHelp: 'Entrez une URL de vidéo directe (format MP4 recommandé)',
  cancel: 'Annuler',
  create: 'Créer',
  update: 'Mettre à jour',
  newLesson: 'Nouvelle leçon',
  editLesson: 'Modifier la leçon'
};

export default function LessonModal({ lesson, isOpen, onClose, onSave }: LessonModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (lesson && isOpen) {
      setTitle(lesson.title);
      setContent(lesson.content);
      setVideoUrl(lesson.videoUrl || '');
    } else if (!lesson && isOpen) {
      setTitle('');
      setContent('');
      setVideoUrl('');
    }
  }, [lesson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      content: content.trim(),
      videoUrl: videoUrl.trim() || undefined,
      order: lesson?.order ?? 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {lesson ? labels.editLesson : labels.newLesson}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {labels.title}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {labels.content}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {labels.videoUrl}
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={labels.videoUrlPlaceholder}
              pattern="https?://.+"
              title={labels.videoUrlHelp}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {labels.videoUrlHelp}
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {labels.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {lesson ? labels.update : labels.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}