
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types';

/**
 * Creates automatic mortgage transactions for properties with credit_mensuel set
 * @param userId The current user ID
 * @returns A promise that resolves with the number of transactions created
 */
export const createAutomaticMortgageTransactions = async (userId: string): Promise<number> => {
  try {
    // Get all active properties with credit_mensuel set
    const { data: properties, error: propertiesError } = await supabase
      .from('proprietes')
      .select('*')
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .not('credit_mensuel', 'is', null);
      
    if (propertiesError) throw propertiesError;
    
    if (!properties || properties.length === 0) {
      return 0; // No properties with mortgage
    }
    
    let transactionsCreated = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Process each property with a mortgage
    for (const property of properties) {
      if (!property.credit_mensuel || !property.jour_prelevement_credit || !property.date_debut_credit) {
        continue; // Skip if missing required mortgage data
      }
      
      // Skip if mortgage hasn't started yet
      const creditStartDate = new Date(property.date_debut_credit);
      if (creditStartDate > today) {
        continue;
      }
      
      // Skip if mortgage has ended
      if (property.date_fin_credit) {
        const creditEndDate = new Date(property.date_fin_credit);
        if (creditEndDate < today) {
          continue;
        }
      }
      
      // Check if we already have an automatic mortgage transaction for this month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      const { data: existingTransactions, error: existingError } = await supabase
        .from('transactions_new')
        .select('id')
        .eq('propriete_id', property.id)
        .eq('type', 'depense')
        .eq('categorie', 'credit')
        .eq('est_automatique', true)
        .gte('date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('date', lastDayOfMonth.toISOString().split('T')[0]);
        
      if (existingError) throw existingError;
      
      if (existingTransactions && existingTransactions.length > 0) {
        continue; // Skip if we already have a mortgage transaction for this month
      }
      
      // Create the mortgage transaction
      const transactionDate = new Date(currentYear, currentMonth, property.jour_prelevement_credit);
      // If the day has already passed this month, use that day, otherwise use the first of next month
      const actualDate = transactionDate < today ? transactionDate : new Date(currentYear, currentMonth, property.jour_prelevement_credit);
      
      const formattedDate = actualDate.toISOString().split('T')[0];
      const month = actualDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      const { error: insertError } = await supabase
        .from('transactions_new')
        .insert({
          propriete_id: property.id,
          type: 'depense',
          montant: property.credit_mensuel,
          date: formattedDate,
          description: `Remboursement crédit ${property.nom} - ${month}`,
          categorie: 'credit',
          statut: 'complété',
          est_automatique: true,
        });
        
      if (insertError) throw insertError;
      
      transactionsCreated++;
    }
    
    return transactionsCreated;
  } catch (error) {
    console.error('Error creating automatic mortgage transactions:', error);
    return 0;
  }
};
