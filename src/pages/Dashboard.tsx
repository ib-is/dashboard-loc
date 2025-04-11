
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { format, subMonths, startOfMonth } from 'date-fns';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { FreeAccountDashboard } from '@/components/dashboard/FreeAccountDashboard';
import { PlusAccountDashboard } from '@/components/dashboard/PlusAccountDashboard';
import { ProAccountDashboard } from '@/components/dashboard/ProAccountDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProperties(data || []);
        
        // If there are properties, fetch transactions
        if (data && data.length > 0) {
          // Determine period based on user account level
          const userNiveau = user.niveau_compte || 'free';
          const period = userNiveau === 'pro' ? 12 : userNiveau === 'plus' ? 6 : 3;
          const startDate = format(subMonths(startOfMonth(new Date()), period - 1), 'yyyy-MM-dd');
          
          // Fetch transactions for all properties
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions_new')
            .select('*')
            .in('propriete_id', data.map(p => p.id))
            .gte('date', startDate)
            .order('date', { ascending: false });
            
          if (transactionsError) throw transactionsError;
          setTransactions(transactionsData || []);
        }
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const getFilteredTransactions = () => {
    if (selectedProperty === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.propriete_id === selectedProperty);
  };

  const renderDashboardByLevel = () => {
    if (!user) return null;
    
    // Get filtered transactions for the selected property or all
    const filteredTransactions = getFilteredTransactions();
    
    // Basic stats that appear in all dashboards
    const statsComponent = <DashboardStats transactions={filteredTransactions} />;

    // Default to free if niveau_compte is not defined
    const userNiveau = user.niveau_compte || 'free';

    // Render dashboard based on account level
    switch (userNiveau) {
      case 'plus':
        return (
          <div className="space-y-6">
            {statsComponent}
            <PlusAccountDashboard 
              properties={properties} 
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              selectedProperty={selectedProperty}
            />
          </div>
        );
        
      case 'pro':
        return (
          <div className="space-y-6">
            {statsComponent}
            <ProAccountDashboard 
              properties={properties} 
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              selectedProperty={selectedProperty}
            />
          </div>
        );
        
      default: // Free level
        return (
          <div className="space-y-6">
            {statsComponent}
            <FreeAccountDashboard properties={properties} />
          </div>
        );
    }
  };

  return (
    <Layout>
      <DashboardHeader 
        properties={properties}
        user={user}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
      />

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        renderDashboardByLevel()
      )}
    </Layout>
  );
}
