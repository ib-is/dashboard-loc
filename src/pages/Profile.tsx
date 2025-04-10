
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Property, Roommate, Transaction } from '@/types';
import { ArrowRight, Check } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  nom_complet: string;
  niveau_compte: string;
  date_inscription: string;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  propertyLimit: number | null;
  highlighted: boolean;
  current: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Récupérer le profil
        const { data: profileData, error: profileError } = await supabase
          .from('profils')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);
        
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
            .in('propriete_id', propertyIds);
          
          if (transactionsError) throw transactionsError;
          setTransactions(transactionsData || []);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données utilisateur.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleUpgradePlan = async (newPlan: string) => {
    if (!user || !profile) return;
    
    // Vérifier si le plan est différent du plan actuel
    if (newPlan === profile.niveau_compte) {
      toast({
        title: "Information",
        description: `Vous êtes déjà sur le plan ${newPlan}.`,
      });
      return;
    }
    
    try {
      setUpgrading(true);
      
      // Dans un environnement de production, ici on redirigerait vers une page de paiement
      // Pour ce MVP, on met à jour directement le niveau de compte
      
      const { error } = await supabase
        .from('profils')
        .update({ niveau_compte: newPlan })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, niveau_compte: newPlan });
      
      toast({
        title: "Compte mis à niveau",
        description: `Votre compte a été mis à niveau vers le plan ${newPlan}.`,
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à niveau du compte:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à niveau le compte.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const getSubscriptionPlans = (): SubscriptionPlan[] => {
    if (!profile) return [];
    
    return [
      {
        name: 'Free',
        price: '0€',
        description: 'Pour les propriétaires débutants',
        features: ['1 propriété', 'Gestion des colocataires', 'Suivi financier de base'],
        propertyLimit: 1,
        highlighted: false,
        current: profile.niveau_compte === 'free',
      },
      {
        name: 'Plus',
        price: '9,99€',
        description: 'Pour les petits investisseurs',
        features: ['3 propriétés', 'Gestion des colocataires', 'Suivi financier complet', 'Alertes personnalisées'],
        propertyLimit: 3,
        highlighted: true,
        current: profile.niveau_compte === 'plus',
      },
      {
        name: 'Pro',
        price: '24,99€',
        description: 'Pour les investisseurs expérimentés',
        features: ['Propriétés illimitées', 'Gestion avancée des colocataires', 'Rapports détaillés', 'Support prioritaire'],
        propertyLimit: null,
        highlighted: false,
        current: profile.niveau_compte === 'pro',
      },
    ];
  };

  const calculateActiveRoommates = () => {
    return roommates.filter(r => r.statut === 'actif').length;
  };

  const calculateTotalRent = () => {
    return roommates
      .filter(r => r.statut === 'actif')
      .reduce((sum, r) => sum + Number(r.montant_loyer), 0);
  };

  const calculateRevenues = () => {
    return transactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + Number(t.montant), 0);
  };

  const calculateExpenses = () => {
    return transactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + Number(t.montant), 0);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : profile ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Vos informations de compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg">{profile.nom_complet}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Niveau de compte</p>
                  <p className="text-lg capitalize">{profile.niveau_compte}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                  <p className="text-lg">
                    {new Date(profile.date_inscription).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Statistiques générales</CardTitle>
              <CardDescription>
                Aperçu de votre activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground">Propriétés</p>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground">Colocataires actifs</p>
                  <p className="text-2xl font-bold">{calculateActiveRoommates()}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground">Loyers mensuels</p>
                  <p className="text-2xl font-bold">{calculateTotalRent().toFixed(2)} €</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground">Cash flow total</p>
                  <p className={`text-2xl font-bold ${calculateRevenues() - calculateExpenses() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(calculateRevenues() - calculateExpenses()).toFixed(2)} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Plans d'abonnement</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {getSubscriptionPlans().map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`${plan.highlighted ? 'ring-2 ring-primary' : ''} ${plan.current ? 'bg-muted' : ''}`}
                >
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center justify-between">
                        {plan.name}
                        {plan.current && (
                          <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                            Actuel
                          </span>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                      <p className="mt-1">{plan.description}</p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={plan.current || upgrading}
                      onClick={() => handleUpgradePlan(plan.name.toLowerCase())}
                      variant={plan.current ? "outline" : (plan.highlighted ? "default" : "outline")}
                    >
                      {plan.current 
                        ? 'Plan actuel' 
                        : profile.niveau_compte === 'pro' && plan.name.toLowerCase() !== 'pro'
                          ? 'Rétrograder'
                          : 'Mettre à niveau'}
                      {!plan.current && !upgrading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>
                Mettre à jour votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pour changer votre mot de passe, cliquez sur le bouton ci-dessous. Vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
              </p>
              <Button variant="outline">
                Réinitialiser le mot de passe
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger les informations de profil.</p>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
