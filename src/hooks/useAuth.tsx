import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Connexion réussie !');
    } catch (error: any) {
      // Generic error message to prevent email enumeration
      toast.error('Email ou mot de passe incorrect');
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    companyName?: string
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });
      
      if (error) throw error;
      toast.success('Compte créé ! Vérifiez votre email.');
    } catch (error: any) {
      // Generic error message to prevent information leakage
      toast.error('Impossible de créer le compte. Veuillez réessayer.');
      throw error;
    }
  };


  const signOut = async () => {
    // 1. Nettoyer IMMÉDIATEMENT le state local pour un feedback instantané
    setUser(null);
    setSession(null);
    
    // 2. Afficher le toast de succès immédiatement
    toast.success('Déconnexion réussie');
    
    // 3. Appel serveur en arrière-plan (fire-and-forget)
    // On ne bloque pas l'UI pour attendre la réponse
    supabase.auth.signOut().catch((error) => {
      // Ignorer silencieusement les erreurs de session expirée
      if (!error.message?.toLowerCase().includes('session')) {
        console.error('Background logout error:', error);
      }
    });
  };

  const hasRole = useCallback(async (role: AppRole): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', role)
        .maybeSingle();
      
      return !!data;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }, [user]);

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    hasRole,
  };
};
