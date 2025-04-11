
import { useMemo } from 'react';
import { Transaction } from '@/types';

export function useTransactionStats(transactions: Transaction[]) {
  const stats = useMemo(() => {
    const totalRevenues = transactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + Number(t.montant), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + Number(t.montant), 0);
    
    const balance = totalRevenues - totalExpenses;

    return {
      totalRevenues,
      totalExpenses,
      balance
    };
  }, [transactions]);

  return stats;
}
