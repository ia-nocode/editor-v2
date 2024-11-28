import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEditorAuth } from './hooks/useEditorAuth';
import { getAdminAuth } from './services/auth';
import Login from './components/Login';
import CourseManagement from './components/CourseManagement';
import LoadingSpinner from './components/LoadingSpinner';
import AccessDenied from './components/AccessDenied';

function App() {
  const adminAuth = getAdminAuth();
  const [user, loading] = useAuthState(adminAuth);
  const { isEditor, loading: editorLoading } = useEditorAuth(user);

  if (loading || editorLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isEditor ? <CourseManagement /> : <AccessDenied />}
    </div>
  );
}

export default App;