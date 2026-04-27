import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loader if still loading or not initialized and not authenticated
  if (loading || (!initialized && !isAuthenticated)) {
    return <Loader fullScreen />;
  }

  // If initialized but not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access (case-insensitive)
  if (allowedRoles && user?.role) {
    const userRole = user.role.toLowerCase();
    const normalizedRoles = allowedRoles.map(role => role.toLowerCase());
    if (!normalizedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
