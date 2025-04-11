
import { useState, useMemo } from 'react';
import { Transaction } from '@/types';

export function useTransactionFilters(transactions: Transaction[]) {
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleTypeFilterChange = (type: string) => {
    if (typeFilter.includes(type)) {
      setTypeFilter(typeFilter.filter(t => t !== type));
    } else {
      setTypeFilter([...typeFilter, type]);
    }
  };

  const resetFilters = () => {
    setTypeFilter([]);
    setDateRangeStart('');
    setDateRangeEnd('');
    setSearchTerm('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (typeFilter.length > 0 && !typeFilter.includes(transaction.type)) {
        return false;
      }
      
      if (dateRangeStart && new Date(transaction.date) < new Date(dateRangeStart)) {
        return false;
      }
      
      if (dateRangeEnd && new Date(transaction.date) > new Date(dateRangeEnd)) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.categorie?.toLowerCase().includes(searchLower) ||
          transaction.montant.toString().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [transactions, typeFilter, dateRangeStart, dateRangeEnd, searchTerm]);

  return {
    typeFilter,
    dateRangeStart,
    dateRangeEnd,
    searchTerm,
    isSearchOpen,
    filteredTransactions,
    setDateRangeStart,
    setDateRangeEnd,
    setSearchTerm,
    setIsSearchOpen,
    handleTypeFilterChange,
    resetFilters
  };
}
