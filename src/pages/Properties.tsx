
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Récupérer le profil de l'utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('profils')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setUserProfile(profileData);
        
        // Récupérer les propriétés
        const { data, error } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setProperties(data || []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des propriétés:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les propriétés.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [user]);

  const handleDeleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proprietes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProperties(properties.filter(property => property.id !== id));
      
      toast({
        title: "Propriété supprimée",
        description: "La propriété a été supprimée avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la propriété:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la propriété.",
        variant: "destructive",
      });
    }
  };

  const getPropertyLimitMessage = () => {
    if (!userProfile) return '';
    
    switch (userProfile.niveau_compte) {
      case 'free':
        return properties.length >= 1 
          ? "Vous avez atteint la limite de 1 propriété du compte Free. Passez au compte Plus pour en ajouter plus." 
          : "Compte Free: 1 propriété maximum";
      case 'plus':
        return properties.length >= 3 
          ? "Vous avez atteint la limite de 3 propriétés du compte Plus. Passez au compte Pro pour en ajouter plus." 
          : "Compte Plus: 3 propriétés maximum";
      case 'pro':
        return "Compte Pro: propriétés illimitées";
      default:
        return '';
    }
  };

  const canAddProperty = () => {
    if (!userProfile) return false;
    
    switch (userProfile.niveau_compte) {
      case 'free':
        return properties.length < 1;
      case 'plus':
        return properties.length < 3;
      case 'pro':
        return true;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Propriétés</h1>
        <div>
          {canAddProperty() ? (
            <Link to="/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Ajouter une propriété
              </Button>
            </Link>
          ) : (
            <Link to="/profile">
              <Button variant="outline">
                Mettre à niveau
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        {getPropertyLimitMessage()}
      </p>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Home className="mr-2 h-5 w-5" />
                      {property.nom}
                    </CardTitle>
                    <CardDescription>
                      {property.adresse}, {property.code_postal} {property.ville}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/properties/edit/${property.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la propriété</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action supprimera également tous les colocataires et transactions associés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProperty(property.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-sm">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chambres</p>
                    <p className="text-sm">{property.nombre_chambres}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                    <p className={`text-sm ${property.statut === 'actif' ? 'text-green-500' : 'text-red-500'}`}>
                      {property.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pays</p>
                    <p className="text-sm">{property.pays}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/roommates?propertyId=${property.id}`)}
                >
                  Gérer les colocataires
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/transactions?propertyId=${property.id}`)}
                >
                  Finances
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucune propriété</CardTitle>
            <CardDescription>
              Vous n'avez pas encore ajouté de propriété.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Commencez par ajouter votre première propriété pour suivre vos locations.
            </p>
            {canAddProperty() && (
              <Link to="/properties/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une propriété
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
