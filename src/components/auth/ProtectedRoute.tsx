import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from './AuthPage';
import ProfileSetup from './ProfileSetup';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth page
  if (!user) {
    return <AuthPage />;
  }

  // If authenticated but no profile, show profile setup
  if (!profile) {
    return <ProfileSetup />;
  }

  // If authenticated and has profile, show protected content
  return <>{children}</>;
};

export default ProtectedRoute;