
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { fetchUserProfile, createAutomaticTransactions } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          try {
            // Fetch user profile data to get niveau_compte
            const profileData = await fetchUserProfile(newSession.user.id);
            
            // Extend the user object with profile data
            setUser({
              ...newSession.user,
              niveau_compte: profileData?.niveau_compte || 'free',
              date_inscription: profileData?.date_inscription
            });
            
            // Check and create automatic transactions
            const count = await createAutomaticTransactions(newSession.user.id);
            if (count > 0) {
              toast({
                title: "Transactions automatiques",
                description: `${count} transaction(s) de crédit immobilier ont été créées automatiquement.`,
              });
            }
          } catch (error) {
            console.error('Error processing user session:', error);
          }
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        try {
          // Fetch user profile data to get niveau_compte
          const profileData = await fetchUserProfile(currentSession.user.id);
          
          // Extend the user object with profile data
          setUser({
            ...currentSession.user,
            niveau_compte: profileData?.niveau_compte || 'free',
            date_inscription: profileData?.date_inscription
          });
          
          // Check for automatic transactions
          const count = await createAutomaticTransactions(currentSession.user.id);
          if (count > 0) {
            toast({
              title: "Transactions automatiques",
              description: `${count} transaction(s) de crédit immobilier ont été créées automatiquement.`,
            });
          }
        } catch (error) {
          console.error('Error processing user session:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  return { session, user, loading, setLoading };
}
