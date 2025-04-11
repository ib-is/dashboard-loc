
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  metadata: { nom_complet: string };
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp({ email, password, metadata }: SignUpData) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
}

export async function signIn({ email, password }: SignInData) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchUserProfile(userId: string): Promise<Partial<User> | null> {
  const { data } = await supabase
    .from('profils')
    .select('niveau_compte, date_inscription')
    .eq('id', userId)
    .single();
    
  return data ? {
    niveau_compte: data.niveau_compte || 'free',
    date_inscription: data.date_inscription
  } : null;
}

export async function createAutomaticTransactions(userId: string): Promise<number> {
  try {
    // This implementation stays the same but is moved to the service
    const { data: properties } = await supabase
      .from('proprietes')
      .select('id, credit_mensuel, jour_prelevement_credit, date_debut_credit, date_fin_credit')
      .eq('user_id', userId)
      .eq('statut', 'actif');
    
    if (!properties || properties.length === 0) return 0;
    
    const today = new Date();
    let transactionsCreated = 0;
    
    for (const property of properties) {
      if (!property.credit_mensuel || !property.jour_prelevement_credit || !property.date_debut_credit) continue;
      
      const startDate = new Date(property.date_debut_credit);
      
      // Skip if mortgage hasn't started yet
      if (startDate > today) continue;
      
      // Skip if mortgage has ended
      if (property.date_fin_credit && new Date(property.date_fin_credit) < today) continue;
      
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Check if we need to create a transaction for this month
      const transactionDate = new Date(currentYear, currentMonth, property.jour_prelevement_credit);
      
      // If the transaction day has already passed this month
      if (transactionDate <= today) {
        // Check if a transaction already exists for this month
        const { data: existingTransactions } = await supabase
          .from('transactions_new')
          .select('id')
          .eq('propriete_id', property.id)
          .eq('type', 'depense')
          .eq('est_automatique', true)
          .eq('categorie', 'Crédit immobilier')
          .gte('date', new Date(currentYear, currentMonth, 1).toISOString().split('T')[0])
          .lt('date', new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0]);
        
        if (!existingTransactions || existingTransactions.length === 0) {
          // Create a transaction for this month
          const { error } = await supabase
            .from('transactions_new')
            .insert({
              propriete_id: property.id,
              type: 'depense',
              montant: property.credit_mensuel,
              date: transactionDate.toISOString().split('T')[0],
              description: 'Paiement mensuel du crédit immobilier',
              categorie: 'Crédit immobilier',
              est_automatique: true
            });
          
          if (!error) transactionsCreated++;
        }
      }
    }
    
    return transactionsCreated;
  } catch (error) {
    console.error('Error creating automatic transactions:', error);
    return 0;
  }
}
