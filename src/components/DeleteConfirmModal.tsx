import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemType: 'course' | 'lesson';
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemType,
  title,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText === title) {
      onConfirm();
      setConfirmText('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {itemType === 'course' ? 'Supprimer le cours' : 'Supprimer la leçon'}
          </h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cette action est irréversible. Veuillez saisir <strong>{title}</strong> pour confirmer la suppression.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre pour confirmation
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError(false);
                }}
                className={`w-full px-3 py-2 border ${
                  error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Saisissez le titre pour confirmer"
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Le texte ne correspond pas. Veuillez réessayer.
                </p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Détails :
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Titre :</span> {title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}