
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Roommate, Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    propertyCount: 0,
    roommateCount: 0,
    activeRoommateCount: 0,
    totalRent: 0,
    currentMonthRevenue: 0,
    currentMonthExpenses: 0,
    overduePayments: 0,
  });
  
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les propriétés
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id);
        
        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);
        
        if (propertiesData && propertiesData.length > 0) {
          const propertyIds = propertiesData.map(p => p.id);
          
          // Récupérer les colocataires
          const { data: roommatesData, error: roommatesError } = await supabase
            .from('colocataires_new')
            .select('*')
            .in('propriete_id', propertyIds);
          
          if (roommatesError) throw roommatesError;
          setRoommates(roommatesData || []);
          
          // Récupérer les transactions
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions_new')
            .select('*')
            .in('propriete_id', propertyIds)
            .order('date', { ascending: false });
          
          if (transactionsError) throw transactionsError;
          setTransactions(transactionsData || []);
          
          // Calculer les statistiques
          const activeRoommates = roommatesData?.filter(r => r.statut === 'actif') || [];
          const currentDate = new Date();
          const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          
          const currentMonthTransactions = transactionsData?.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth;
          }) || [];
          
          const currentMonthRevenue = currentMonthTransactions
            .filter(t => t.type === 'revenu')
            .reduce((sum, t) => sum + Number(t.montant), 0);
          
          const currentMonthExpenses = currentMonthTransactions
            .filter(t => t.type === 'depense')
            .reduce((sum, t) => sum + Number(t.montant), 0);
          
          const totalRent = activeRoommates.reduce((sum, r) => sum + Number(r.montant_loyer), 0);
          
          // Compter les paiements en retard (à simuler pour le MVP)
          // Dans une version réelle, nous vérifierions les loyers du mois en cours qui n'ont pas été payés
          const overduePayments = activeRoommates.length - currentMonthTransactions.filter(t => 
            t.type === 'revenu' && t.categorie === 'loyer'
          ).length;
          
          setSummary({
            propertyCount: propertiesData.length,
            roommateCount: roommatesData?.length || 0,
            activeRoommateCount: activeRoommates.length,
            totalRent,
            currentMonthRevenue,
            currentMonthExpenses,
            overduePayments: overduePayments > 0 ? overduePayments : 0,
          });
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Préparer les données pour le graphique
  const getLastSixMonths = () => {
    const months = [];
    const date = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push({
        month: month.toLocaleString('fr-FR', { month: 'short' }),
        year: month.getFullYear(),
        fullDate: month,
      });
    }
    
    return months;
  };
  
  const chartData = getLastSixMonths().map(monthData => {
    const monthStart = monthData.fullDate;
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
    
    const revenue = monthTransactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + Number(t.montant), 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + Number(t.montant), 0);
    
    return {
      name: `${monthData.month} ${monthData.year}`,
      revenus: revenue,
      depenses: expenses,
      netCashFlow: revenue - expenses,
    };
  });

  if (loading) {
    return (
      <Layout>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      {properties.length === 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue sur CoRent !</CardTitle>
              <CardDescription>
                Commencez par ajouter votre première propriété pour suivre vos locations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/properties/new" className="inline-block">
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Ajouter une propriété
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Alerte pour les paiements en retard */}
          {summary.overduePayments > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                Vous avez {summary.overduePayments} loyer(s) impayé(s) ce mois-ci.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Statistiques générales */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Propriétés</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.propertyCount}</div>
                <p className="text-xs text-muted-foreground">
                  {user && summary.propertyCount > 0 && properties[0]?.statut === 'free' 
                    ? `Limite: 1 propriété`
                    : summary.propertyCount > 0 && properties[0]?.statut === 'plus'
                    ? `Limite: 3 propriétés`
                    : `Propriétés illimitées`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Colocataires actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.activeRoommateCount}</div>
                <p className="text-xs text-muted-foreground">
                  Sur un total de {summary.roommateCount} colocataires
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loyers mensuels</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalRent.toFixed(2)} €</div>
                <p className="text-xs text-muted-foreground">
                  Revenus locatifs attendus par mois
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Statistiques financières du mois en cours */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Finances du mois</CardTitle>
              <CardDescription>
                Résumé des revenus et dépenses du mois en cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Revenus</h3>
                  <p className="text-2xl font-bold text-green-600">{summary.currentMonthRevenue.toFixed(2)} €</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Dépenses</h3>
                  <p className="text-2xl font-bold text-red-600">{summary.currentMonthExpenses.toFixed(2)} €</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Cash flow</h3>
                  <p className={`text-2xl font-bold ${summary.currentMonthRevenue - summary.currentMonthExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(summary.currentMonthRevenue - summary.currentMonthExpenses).toFixed(2)} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Graphique d'évolution du cash flow */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution du cash flow</CardTitle>
              <CardDescription>
                Tendance des 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenus" name="Revenus" fill="#10b981" />
                    <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" />
                    <Bar dataKey="netCashFlow" name="Cash Flow Net" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Dernières transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Dernières transactions</CardTitle>
              <CardDescription>
                Les 5 dernières opérations financières
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => {
                    const property = properties.find(p => p.id === transaction.propriete_id);
                    const roommate = roommates.find(r => r.id === transaction.colocataire_id);
                    
                    return (
                      <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{transaction.description || (transaction.type === 'revenu' ? 'Revenu' : 'Dépense')}</p>
                          <p className="text-sm text-gray-500">
                            {property?.nom} {roommate && `- ${roommate.prenom} ${roommate.nom}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <p className={`font-bold ${transaction.type === 'revenu' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'revenu' ? '+' : '-'}{Number(transaction.montant).toFixed(2)} €
                        </p>
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <Link to="/transactions" className="text-primary hover:underline">
                      Voir toutes les transactions
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Aucune transaction enregistrée.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
