
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createAutomaticMortgageTransactions } from '@/utils/automaticTransactions';
import { User } from '@/types';

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Fetch user profile data to get niveau_compte
          const { data } = await supabase
            .from('profils')
            .select('niveau_compte, date_inscription')
            .eq('id', newSession.user.id)
            .single();
            
          // Extend the user object with profile data
          setUser({
            ...newSession.user,
            niveau_compte: data?.niveau_compte || 'free',
            date_inscription: data?.date_inscription
          });
          
          // Check and create automatic transactions
          createAutomaticMortgageTransactions(newSession.user.id)
            .then(count => {
              if (count > 0) {
                toast({
                  title: "Transactions automatiques",
                  description: `${count} transaction(s) de crédit immobilier ont été créées automatiquement.`,
                });
              }
            })
            .catch(error => {
              console.error('Error creating automatic transactions:', error);
            });
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Fetch user profile data to get niveau_compte
        const { data } = await supabase
          .from('profils')
          .select('niveau_compte, date_inscription')
          .eq('id', currentSession.user.id)
          .single();
          
        // Extend the user object with profile data
        setUser({
          ...currentSession.user,
          niveau_compte: data?.niveau_compte || 'free',
          date_inscription: data?.date_inscription
        });
        
        // Check for automatic transactions
        createAutomaticMortgageTransactions(currentSession.user.id)
          .then(count => {
            if (count > 0) {
              toast({
                title: "Transactions automatiques",
                description: `${count} transaction(s) de crédit immobilier ont été créées automatiquement.`,
              });
            }
          })
          .catch(error => {
            console.error('Error creating automatic transactions:', error);
          });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, metadata: { nom_complet: string }) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
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
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
