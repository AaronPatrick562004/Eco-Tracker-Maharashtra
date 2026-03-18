import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Leaf } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-green-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Only check if user is authenticated - NO ROLE CHECK!
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow ALL authenticated users to access ANY page
  return <>{children}</>;
};

export default ProtectedRoute;