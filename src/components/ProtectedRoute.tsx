import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: AppRole;
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isLoading, hasRole } = useAuth();
  const [roleCheck, setRoleCheck] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRoleCheck(null);
        return;
      }

      if (!requireRole) {
        setRoleCheck(true);
        return;
      }

      setCheckingRole(true);
      try {
        const hasRequiredRole = await hasRole(requireRole);
        setRoleCheck(hasRequiredRole);
      } catch (error) {
        console.error('Error checking role:', error);
        setRoleCheck(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkUserRole();
  }, [user, requireRole, hasRole]);

  // Show loading spinner while auth is loading OR while checking role
  if (isLoading || checkingRole || (user && requireRole && roleCheck === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show access denied if role check failed
  if (requireRole && roleCheck === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
