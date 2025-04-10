
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Roommate, Transaction } from '@/types';
import { ArrowUpRight, Users, HomeIcon, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createAutomaticMortgageTransactions } from '@/utils/automaticTransactions';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  
  const [summary, setSummary] = useState({
    propertyCount: 0,
    roommateCount: 0,
    totalRevenue: 0,
    totalExpense: 0,
    balance: 0,
    pendingPayments: 0,
    upcomingPayments: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Create automatic mortgage transactions
        if (user.id) {
          await createAutomaticMortgageTransactions(user.id);
        }
        
        // Récupérer les propriétés
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id);
        
        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);
        
        if (propertiesData && propertiesData.length > 0) {
          // Récupérer les colocataires
          const propertyIds = propertiesData.map(p => p.id);
          
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
          setLatestTransactions(transactionsData?.slice(0, 5) || []);
          
          // Calculer les statistiques
          const totalRevenue = transactionsData
            ?.filter(t => t.type === 'revenu')
            .reduce((sum, t) => sum + Number(t.montant), 0) || 0;
          
          const totalExpense = transactionsData
            ?.filter(t => t.type === 'depense')
            .reduce((sum, t) => sum + Number(t.montant), 0) || 0;
          
          const pendingPayments = transactionsData
            ?.filter(t => t.statut === 'en attente' && t.type === 'revenu')
            .reduce((sum, t) => sum + Number(t.montant), 0) || 0;
          
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const totalRent = roommatesData
            ?.filter(r => r.statut === 'actif')
            .reduce((sum, r) => sum + Number(r.montant_loyer), 0) || 0;
          
          // Mise à jour du résumé
          setSummary({
            propertyCount: propertiesData.length,
            roommateCount: roommatesData?.length || 0,
            totalRevenue,
            totalExpense,
            balance: totalRevenue - totalExpense,
            pendingPayments,
            upcomingPayments: totalRent,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-4">Tableau de bord</h2>
          {properties.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Bienvenue sur votre application de gestion locative</h3>
                  <p className="mb-4 text-muted-foreground">
                    Commencez par ajouter votre première propriété pour gérer vos locations et suivre vos revenus.
                  </p>
                  <Button onClick={() => navigate('/properties/new')}>
                    Ajouter une propriété
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Dashboard Statistics */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Propriétés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.propertyCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {user && (
                        user.niveau_compte === 'free' 
                          ? `Limite: 1 propriété`
                          : user.niveau_compte === 'plus'
                          ? `Limite: 3 propriétés`
                          : `Propriétés illimitées`)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Colocataires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.roommateCount}</div>
                    <p className="text-xs text-muted-foreground">Loyer mensuel total: {summary.upcomingPayments.toFixed(2)} €</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.balance.toFixed(2)} €
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Revenus: {summary.totalRevenue.toFixed(2)} €</span>
                      <span>Dépenses: {summary.totalExpense.toFixed(2)} €</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-3">Actions rapides</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-auto py-4 px-6 justify-start" onClick={() => navigate('/properties/new')}>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center mb-1">
                        <HomeIcon className="mr-2 h-5 w-5 text-primary" />
                        <span className="font-medium">Nouvelle propriété</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Ajouter un bien immobilier</span>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 px-6 justify-start" onClick={() => navigate('/roommates/new')}>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center mb-1">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        <span className="font-medium">Nouveau colocataire</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Ajouter un locataire</span>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 px-6 justify-start" onClick={() => navigate('/transactions/new')}>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center mb-1">
                        <ArrowUpRight className="mr-2 h-5 w-5 text-green-600" />
                        <span className="font-medium">Enregistrer un loyer</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Ajouter un paiement reçu</span>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 px-6 justify-start" onClick={() => navigate('/transactions/new')}>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center mb-1">
                        <CreditCard className="mr-2 h-5 w-5 text-red-600" />
                        <span className="font-medium">Enregistrer une dépense</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Ajouter une dépense</span>
                    </div>
                  </Button>
                </div>
              </div>
              
              {/* Recent Transactions */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold">Transactions récentes</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                    Voir tout
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    {latestTransactions.length > 0 ? (
                      <div>
                        {latestTransactions.map(transaction => {
                          const property = properties.find(p => p.id === transaction.propriete_id);
                          const roommate = roommates.find(r => r.id === transaction.colocataire_id);
                          
                          return (
                            <div key={transaction.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {transaction.description || (transaction.type === 'revenu' ? 'Revenu' : 'Dépense')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString('fr-FR')} • 
                                    {property ? ` ${property.nom}` : ''} •
                                    {roommate ? ` ${roommate.prenom} ${roommate.nom}` : ''} •
                                    {transaction.categorie ? ` ${transaction.categorie}` : ''}
                                  </div>
                                </div>
                                <div className={`font-medium ${transaction.type === 'revenu' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'revenu' ? '+' : '-'}{Number(transaction.montant).toFixed(2)} €
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground mb-2">Aucune transaction récente</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/transactions/new')}>
                          Ajouter une transaction
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
