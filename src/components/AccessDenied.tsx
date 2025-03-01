import React from 'react';
import { XCircle } from 'lucide-react';
import { getAdminAuth } from '../services/auth';
import toast from 'react-hot-toast';

export default function AccessDenied() {
  const adminAuth = getAdminAuth();
  
  const handleLogout = async () => {
    try {
      await adminAuth.signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Échec de la déconnexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Accès refusé
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Seuls les éditeurs peuvent accéder au système de gestion des cours.
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}