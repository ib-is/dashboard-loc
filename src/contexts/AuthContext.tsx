
import { createContext, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from '@/services/authService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string, metadata: { nom_complet: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, user, loading, setLoading } = useAuthState();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUp = async (email: string, password: string, metadata: { nom_complet: string }) => {
    try {
      setLoading(true);
      await authSignUp({ email, password, metadata });
      toast({
        title: "Inscription réussie",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authSignIn({ email, password });
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre espace locataire.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      toast({
        title: "Erreur lors de la connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authSignOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur lors de la déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
