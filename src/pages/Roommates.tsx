
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Roommate, Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, User, Phone, Mail, CreditCard } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Roommates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPropertyId = queryParams.get('propertyId');
  
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(initialPropertyId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Récupérer les propriétés
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id)
          .order('nom');
        
        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);
        
        // Si aucune propriété n'est encore sélectionnée et que des propriétés existent, sélectionnez la première
        if (!selectedPropertyId && propertiesData && propertiesData.length > 0) {
          setSelectedPropertyId(propertiesData[0].id);
        }
        
        // Récupérer les colocataires si une propriété est sélectionnée
        if (selectedPropertyId) {
          const { data: roommatesData, error: roommatesError } = await supabase
            .from('colocataires_new')
            .select('*')
            .eq('propriete_id', selectedPropertyId)
            .order('nom');
          
          if (roommatesError) throw roommatesError;
          setRoommates(roommatesData || []);
        } else {
          setRoommates([]);
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
    // Mettre à jour l'URL sans recharger la page
    navigate(`/roommates?propertyId=${propertyId}`, { replace: true });
  };

  const handleDeleteRoommate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('colocataires_new')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRoommates(roommates.filter(roommate => roommate.id !== id));
      
      toast({
        title: "Colocataire supprimé",
        description: "Le colocataire a été supprimé avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression du colocataire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le colocataire.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Colocataires</h1>
        {selectedPropertyId && (
          <Button onClick={() => navigate(`/roommates/new?propertyId=${selectedPropertyId}`)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un colocataire
          </Button>
        )}
      </div>
      
      {properties.length > 0 ? (
        <div className="mb-6">
          <Select
            value={selectedPropertyId || ''}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Sélectionnez une propriété" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aucune propriété trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Vous devez d'abord créer une propriété avant de pouvoir ajouter des colocataires.
            </p>
            <Button onClick={() => navigate('/properties/new')}>
              Ajouter une propriété
            </Button>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : selectedPropertyId && roommates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roommates.map((roommate) => (
            <Card key={roommate.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    <CardTitle>{roommate.prenom} {roommate.nom}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/roommates/edit/${roommate.id}`)}
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
                          <AlertDialogTitle>Supprimer le colocataire</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce colocataire ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRoommate(roommate.id)}
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
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{roommate.email || 'Non renseigné'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{roommate.telephone || 'Non renseigné'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">{Number(roommate.montant_loyer).toFixed(2)} € / mois</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Date d'entrée</p>
                      <p className="text-sm">
                        {new Date(roommate.date_entree).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    {roommate.date_sortie && (
                      <div>
                        <p className="text-xs text-muted-foreground">Date de sortie</p>
                        <p className="text-sm">
                          {new Date(roommate.date_sortie).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <p className={`text-sm font-medium ${roommate.statut === 'actif' ? 'text-green-500' : 'text-red-500'}`}>
                      {roommate.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedPropertyId ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun colocataire</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Vous n'avez pas encore ajouté de colocataire pour cette propriété.
            </p>
            <Button onClick={() => navigate(`/roommates/new?propertyId=${selectedPropertyId}`)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un colocataire
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez une propriété</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Veuillez sélectionner une propriété pour afficher ses colocataires.
            </p>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
