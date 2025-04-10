
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, TrendingUp, BarChart, PieChart, Users, Clock, AlertTriangle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { DashboardCashFlow } from '@/components/dashboard/DashboardCashFlow';
import { DashboardPerformance } from '@/components/dashboard/DashboardPerformance';
import { DashboardReports } from '@/components/dashboard/DashboardReports';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import { DashboardPropertyComparison } from '@/components/dashboard/DashboardPropertyComparison';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
          const period = user.niveau_compte === 'pro' ? 12 : user.niveau_compte === 'plus' ? 6 : 3;
          const startDate = format(subMonths(startOfMonth(new Date()), period - 1), 'yyyy-MM-dd');
          
          // Fetch transactions for the last 12 months for all properties
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

  const propertyLimit = user?.niveau_compte === 'free' ? 1 : 
                        user?.niveau_compte === 'plus' ? 3 : Infinity;
  
  const getFilteredTransactions = () => {
    if (selectedProperty === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.propriete_id === selectedProperty);
  };

  const renderDashboardByLevel = () => {
    if (!user) return null;
    
    // Calculate totals for basic summary
    const filteredTransactions = getFilteredTransactions();
    const totalRevenues = filteredTransactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + Number(t.montant), 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + Number(t.montant), 0);
    
    const balance = totalRevenues - totalExpenses;

    // Basic stats cards that appear in all dashboards
    const basicStats = (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenues)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
            <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <BarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
    
    // Render dashboard based on account level
    switch (user.niveau_compte) {
      case 'plus':
        return (
          <div className="space-y-6">
            {basicStats}
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Cash-flow sur 6 mois</CardTitle>
                  <CardDescription>
                    Évolution de vos revenus et dépenses sur les 6 derniers mois
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DashboardCashFlow 
                    transactions={filteredTransactions} 
                    months={6} 
                    selectedProperty={selectedProperty}
                  />
                </CardContent>
              </Card>
              
              {properties.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparaison des biens</CardTitle>
                    <CardDescription>
                      Performance relative de vos propriétés
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <DashboardPropertyComparison 
                      properties={properties} 
                      transactions={transactions}
                    />
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Indicateurs de performance</CardTitle>
                  <CardDescription>
                    Taux d'occupation, ROI, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <DashboardPerformance 
                    properties={properties}
                    transactions={transactions}
                    selectedProperty={selectedProperty}
                  />
                </CardContent>
              </Card>
              
              <Card className={properties.length > 1 ? "md:col-span-2" : ""}>
                <CardHeader>
                  <CardTitle>Alertes</CardTitle>
                  <CardDescription>
                    Paiements en retard et actions nécessaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardAlerts 
                    properties={properties} 
                    transactions={transactions}
                    onAddPayment={(propertyId, roomateId) => 
                      navigate(`/transactions/new?propertyId=${propertyId}&colocataireId=${roomateId}&type=revenu&categorie=loyer`)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'pro':
        return (
          <div className="space-y-6">
            {basicStats}
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Analyse détaillée (12 mois)</CardTitle>
                  <CardDescription>
                    Évolution de vos revenus et dépenses sur les 12 derniers mois
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <DashboardCashFlow 
                    transactions={filteredTransactions} 
                    months={12}
                    selectedProperty={selectedProperty}
                    showPredictions={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison des biens</CardTitle>
                  <CardDescription>
                    Performance relative de vos propriétés
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <DashboardPropertyComparison 
                    properties={properties} 
                    transactions={transactions}
                    detailed={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance détaillée</CardTitle>
                  <CardDescription>
                    Analyses approfondies de rentabilité
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <DashboardPerformance 
                    properties={properties}
                    transactions={transactions}
                    selectedProperty={selectedProperty}
                    detailed={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alertes importantes</CardTitle>
                  <CardDescription>
                    Paiements en retard et actions nécessaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardAlerts 
                    properties={properties} 
                    transactions={transactions}
                    detailed={true}
                    onAddPayment={(propertyId, roomateId) => 
                      navigate(`/transactions/new?propertyId=${propertyId}&colocataireId=${roomateId}&type=revenu&categorie=loyer`)}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Rapports</CardTitle>
                  <CardDescription>
                    Générez des documents et rapports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardReports 
                    properties={properties} 
                    transactions={transactions}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      default: // Free level
        return (
          <div className="space-y-6">
            {basicStats}
            
            {properties.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pas de propriétés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Commencez par ajouter votre première propriété.
                  </p>
                  <Button onClick={() => navigate('/properties/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une propriété
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Votre propriété</CardTitle>
                    <CardDescription>
                      Détails de votre propriété
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {properties.map((property) => (
                      <div key={property.id} className="p-4 border rounded-md mb-4 last:mb-0">
                        <h3 className="text-lg font-semibold">{property.nom}</h3>
                        <p className="text-sm text-muted-foreground">{property.adresse}, {property.ville}</p>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-4 w-4" /> {property.nombre_chambres} chambres
                        </div>
                        <div className="mt-4 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/roommates?propertyId=${property.id}`)}
                          >
                            Gérer les colocataires
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/transactions?propertyId=${property.id}`)}
                          >
                            Voir les transactions
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Fonctionnalités premium</span>
                        <PieChart className="h-5 w-5 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        Débloquez des fonctionnalités supplémentaires en passant à un forfait Plus ou Pro :
                      </p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center">
                          <BarChart className="h-4 w-4 mr-2 text-primary" />
                          <span>Graphiques de cash-flow sur 6 ou 12 mois</span>
                        </li>
                        <li className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>Gérez jusqu'à 3 propriétés (Plus) ou illimité (Pro)</span>
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                          <span>Alertes pour les paiements en retard</span>
                        </li>
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          <span>Génération de rapports et quittances (Pro)</span>
                        </li>
                      </ul>
                      <Button className="w-full" onClick={() => navigate('/profile')}>
                        Améliorer mon abonnement
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {properties.length > 0 && (
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
            {user?.niveau_compte !== 'free' && (
              <div className="flex gap-2">
                <Select
                  value={selectedProperty}
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Toutes les propriétés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les propriétés</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {properties.length < propertyLimit && (
              <Button onClick={() => navigate('/properties/new')}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter une propriété
              </Button>
            )}
          </div>
        )}
      </div>

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
