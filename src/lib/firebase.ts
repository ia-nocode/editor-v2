import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  const missingFields = requiredFields.filter(
    field => !firebaseConfig[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing Firebase configuration fields: ${missingFields.join(', ')}. ` +
      'Please check your .env file and ensure all required Firebase configuration values are set.'
    );
  }
};

let app: FirebaseApp;
let db: Firestore;

// Initialize Firebase with validation
try {
  validateConfig();
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Provide a more user-friendly error display
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9fafb;
        padding: 20px;
      ">
        <div style="
          max-width: 500px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        ">
          <h1 style="color: #ef4444; margin-bottom: 16px;">Configuration Error</h1>
          <p style="color: #374151; margin-bottom: 16px;">
            Firebase configuration is incomplete or invalid. Please check your environment variables and Firebase setup.
          </p>
          <code style="
            display: block;
            background: #f3f4f6;
            padding: 12px;
            border-radius: 4px;
            color: #374151;
            text-align: left;
            white-space: pre-wrap;
          ">${error instanceof Error ? error.message : 'Unknown error occurred'}</code>
        </div>
      </div>
    `;
  }
  throw error;
}

export { app, db };