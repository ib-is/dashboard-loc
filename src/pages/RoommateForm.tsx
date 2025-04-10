
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from '@/components/Layout';
import { useForm } from 'react-hook-form';

interface RoommateFormValues {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  montant_loyer: number;
  date_entree: string;
  date_sortie?: string;
  statut: string;
  propriete_id: string;
}

export default function RoommateForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const queryParams = new URLSearchParams(location.search);
  const initialPropertyId = queryParams.get('propertyId');
  
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const isEditMode = !!id;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RoommateFormValues>({
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      montant_loyer: 0,
      date_entree: new Date().toISOString().substring(0, 10),
      statut: 'actif',
      propriete_id: initialPropertyId || '',
    }
  });

  const statutRoommate = watch('statut');
  const selectedPropertyId = watch('propriete_id');

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
        
        // Si en mode édition, récupérer les détails du colocataire
        if (isEditMode && id) {
          const { data, error } = await supabase
            .from('colocataires_new')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setValue('nom', data.nom);
            setValue('prenom', data.prenom);
            setValue('email', data.email || '');
            setValue('telephone', data.telephone || '');
            setValue('montant_loyer', data.montant_loyer);
            setValue('date_entree', new Date(data.date_entree).toISOString().substring(0, 10));
            setValue('date_sortie', data.date_sortie ? new Date(data.date_sortie).toISOString().substring(0, 10) : '');
            setValue('statut', data.statut);
            setValue('propriete_id', data.propriete_id);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive",
        });
        navigate('/roommates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, id, isEditMode, setValue, navigate, initialPropertyId]);

  const onSubmit = async (data: RoommateFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Vérifier que la propriété appartient bien à l'utilisateur
      const { data: propertyData, error: propertyError } = await supabase
        .from('proprietes')
        .select('user_id')
        .eq('id', data.propriete_id)
        .single();
      
      if (propertyError) throw propertyError;
      
      if (propertyData.user_id !== user.id) {
        throw new Error('Vous n\'avez pas les droits pour modifier cette propriété');
      }
      
      if (isEditMode && id) {
        // Mise à jour du colocataire
        const { error } = await supabase
          .from('colocataires_new')
          .update({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email || null,
            telephone: data.telephone || null,
            montant_loyer: data.montant_loyer,
            date_entree: data.date_entree,
            date_sortie: data.date_sortie || null,
            statut: data.statut,
            propriete_id: data.propriete_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Colocataire mis à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        });
      } else {
        // Création d'un nouveau colocataire
        const { error } = await supabase
          .from('colocataires_new')
          .insert({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email || null,
            telephone: data.telephone || null,
            montant_loyer: data.montant_loyer,
            date_entree: data.date_entree,
            date_sortie: data.date_sortie || null,
            statut: data.statut,
            propriete_id: data.propriete_id,
          });
        
        if (error) throw error;
        
        toast({
          title: "Colocataire ajouté",
          description: "Le colocataire a été ajouté avec succès.",
        });
      }
      
      navigate(`/roommates?propertyId=${data.propriete_id}`);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement du colocataire:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement du colocataire.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Modifier le colocataire' : 'Ajouter un colocataire'}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Modifier les informations' : 'Informations du colocataire'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Modifiez les informations du colocataire ci-dessous.' 
                : 'Remplissez les informations pour ajouter un nouveau colocataire.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propriete_id">Propriété*</Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(value) => setValue('propriete_id', value)}
                  disabled={properties.length === 0}
                >
                  <SelectTrigger>
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
                {!selectedPropertyId && <p className="text-sm text-red-500">Veuillez sélectionner une propriété</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom*</Label>
                  <Input
                    id="prenom"
                    placeholder="Jean"
                    {...register('prenom', { required: 'Le prénom est requis' })}
                  />
                  {errors.prenom && <p className="text-sm text-red-500">{errors.prenom.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom*</Label>
                  <Input
                    id="nom"
                    placeholder="Dupont"
                    {...register('nom', { required: 'Le nom est requis' })}
                  />
                  {errors.nom && <p className="text-sm text-red-500">{errors.nom.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@exemple.com"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Adresse email invalide"
                    }
                  })}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  placeholder="0612345678"
                  {...register('telephone')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="montant_loyer">Montant du loyer (€)*</Label>
                <Input
                  id="montant_loyer"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('montant_loyer', { 
                    required: 'Le montant du loyer est requis',
                    min: { value: 0, message: 'Le montant doit être positif' }
                  })}
                />
                {errors.montant_loyer && <p className="text-sm text-red-500">{errors.montant_loyer.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_entree">Date d'entrée*</Label>
                  <Input
                    id="date_entree"
                    type="date"
                    {...register('date_entree', { required: 'La date d\'entrée est requise' })}
                  />
                  {errors.date_entree && <p className="text-sm text-red-500">{errors.date_entree.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_sortie">Date de sortie</Label>
                  <Input
                    id="date_sortie"
                    type="date"
                    {...register('date_sortie')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statut">Statut*</Label>
                <Select
                  value={statutRoommate}
                  onValueChange={(value) => setValue('statut', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/roommates${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ''}`)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !selectedPropertyId}>
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Ajouter le colocataire'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
