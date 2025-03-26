
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: Array<'administrator' | 'hr' | 'teacher' | 'parent'>;
};

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  allowedRoles = ['administrator', 'hr', 'teacher', 'parent'] 
}: ProtectedRouteProps) => {
  const isLoggedIn = isAuthenticated();
  const user = getCurrentUser();
  
  if (!isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !user?.isAdmin) {
    // Redirect to home page if admin access is required but user is not admin
    return <Navigate to="/" />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role if current route is not allowed
    switch (user.role) {
      case 'administrator':
        return <Navigate to="/" />;
      case 'hr':
        return <Navigate to="/hr" />;
      case 'teacher':
        return <Navigate to="/teacher" />;
      case 'parent':
        return <Navigate to="/parent" />;
      default:
        return <Navigate to="/login" />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
