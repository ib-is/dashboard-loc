
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, Property, Roommate } from '@/types';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactionFilters } from '@/hooks/use-transaction-filters';
import { useTransactionStats } from '@/hooks/use-transaction-stats';
import PropertySelector from '@/components/transactions/PropertySelector';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionStats from '@/components/transactions/TransactionStats';
import EmptyPropertyState from '@/components/transactions/EmptyPropertyState';
import EmptyTransactionsState from '@/components/transactions/EmptyTransactionsState';
import TransactionTable from '@/components/transactions/TransactionTable';
import MonthlyTransactions from '@/components/transactions/MonthlyTransactions';

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const queryParams = new URLSearchParams(location.search);
  const initialPropertyId = queryParams.get('propertyId');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(initialPropertyId);
  const [loading, setLoading] = useState(true);
  
  const {
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
  } = useTransactionFilters(transactions);
  
  const { totalRevenues, totalExpenses, balance } = useTransactionStats(transactions);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id)
          .order('nom');
        
        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);
        
        if (!selectedPropertyId && propertiesData && propertiesData.length > 0) {
          setSelectedPropertyId(propertiesData[0].id);
        }
        
        if (selectedPropertyId) {
          const { data: roommatesData, error: roommatesError } = await supabase
            .from('colocataires_new')
            .select('*')
            .eq('propriete_id', selectedPropertyId);
          
          if (roommatesError) throw roommatesError;
          setRoommates(roommatesData || []);
          
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions_new')
            .select('*')
            .eq('propriete_id', selectedPropertyId)
            .order('date', { ascending: false });
          
          if (transactionsError) throw transactionsError;
          setTransactions(transactionsData || []);
        } else {
          setRoommates([]);
          setTransactions([]);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, selectedPropertyId, initialPropertyId]);

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    navigate(`/transactions?propertyId=${propertyId}`, { replace: true });
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions_new')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      
      toast({
        title: "Transaction supprimée",
        description: "La transaction a été supprimée avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToTransactionForm = useCallback((colocataireId?: string) => {
    if (!selectedPropertyId) return;
    
    const baseUrl = `/transactions/new?propertyId=${selectedPropertyId}`;
    
    if (colocataireId) {
      const roommate = roommates.find(r => r.id === colocataireId);
      if (roommate) {
        navigate(`${baseUrl}&colocataireId=${colocataireId}&type=revenu&categorie=loyer&montant=${roommate.montant_loyer}`);
        return;
      }
    }
    
    navigate(baseUrl);
  }, [selectedPropertyId, navigate, roommates]);

  return (
    <Layout>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Transactions</h1>
          
          <PropertySelector 
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={handlePropertyChange}
            onAddTransaction={() => handleNavigateToTransactionForm()}
          />
        </div>
        
        {isMobile && (
          <TransactionFilters 
            typeFilter={typeFilter}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            searchTerm={searchTerm}
            isSearchOpen={isSearchOpen}
            isMobile={true}
            onTypeFilterChange={handleTypeFilterChange}
            onDateRangeStartChange={setDateRangeStart}
            onDateRangeEndChange={setDateRangeEnd}
            onSearchTermChange={setSearchTerm}
            onSearchToggle={setIsSearchOpen}
            onResetFilters={resetFilters}
          />
        )}
      </div>
      
      {properties.length === 0 ? (
        <EmptyPropertyState />
      ) : selectedPropertyId && (
        <>
          <TransactionStats 
            totalRevenues={totalRevenues}
            totalExpenses={totalExpenses}
            balance={balance}
          />
          
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="monthly">Vue mensuelle</TabsTrigger>
                <TabsTrigger value="all">Toutes les transactions</TabsTrigger>
              </TabsList>
              
              {!isMobile && (
                <TransactionFilters 
                  typeFilter={typeFilter}
                  dateRangeStart={dateRangeStart}
                  dateRangeEnd={dateRangeEnd}
                  searchTerm={searchTerm}
                  isSearchOpen={isSearchOpen}
                  isMobile={false}
                  onTypeFilterChange={handleTypeFilterChange}
                  onDateRangeStartChange={setDateRangeStart}
                  onDateRangeEndChange={setDateRangeEnd}
                  onSearchTermChange={setSearchTerm}
                  onSearchToggle={setIsSearchOpen}
                  onResetFilters={resetFilters}
                />
              )}
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <>
                <TabsContent value="monthly" className="mt-4">
                  <MonthlyTransactions
                    transactions={filteredTransactions}
                    properties={properties}
                    roommates={roommates}
                    selectedPropertyId={selectedPropertyId}
                    onNavigateToTransactionForm={handleNavigateToTransactionForm}
                  />
                </TabsContent>
                
                <TabsContent value="all" className="mt-4">
                  <TransactionTable 
                    transactions={filteredTransactions}
                    roommates={roommates}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                </TabsContent>
              </>
            ) : (
              <EmptyTransactionsState onAddTransaction={() => handleNavigateToTransactionForm()} />
            )}
          </Tabs>
        </>
      )}
    </Layout>
  );
}
