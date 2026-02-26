import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isRoomOwner, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // Accept the role via the context flags (isRoomOwner, isAdmin) OR the raw role string
    const hasRole =
      (requiredRole === 'roomOwner' && (isRoomOwner || user?.role === 'roomOwner')) ||
      (requiredRole === 'admin' && (isAdmin || user?.role === 'admin')) ||
      user?.role === requiredRole;

    if (!hasRole) {
      console.warn(`[ProtectedRoute] Role mismatch. Required: "${requiredRole}", User has: "${user?.role}"`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
