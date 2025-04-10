
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Roommate } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from '@/components/Layout';
import { useForm } from 'react-hook-form';

interface TransactionFormValues {
  type: string;
  montant: number;
  date: string;
  description?: string;
  categorie?: string;
  colocataire_id?: string;
  propriete_id: string;
  statut: string;
}

export default function TransactionForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const queryParams = new URLSearchParams(location.search);
  const initialPropertyId = queryParams.get('propertyId');
  
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const isEditMode = !!id;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    defaultValues: {
      type: 'revenu',
      montant: 0,
      date: new Date().toISOString().substring(0, 10),
      statut: 'complété',
      propriete_id: initialPropertyId || '',
    }
  });

  const transactionType = watch('type');
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
        
        if (isEditMode && id) {
          // Récupérer les détails de la transaction en mode édition
          const { data, error } = await supabase
            .from('transactions_new')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setValue('type', data.type);
            setValue('montant', data.montant);
            setValue('date', new Date(data.date).toISOString().substring(0, 10));
            setValue('description', data.description || '');
            setValue('categorie', data.categorie || '');
            setValue('colocataire_id', data.colocataire_id || '');
            setValue('propriete_id', data.propriete_id);
            setValue('statut', data.statut);
            
            // Charger les colocataires pour la propriété de cette transaction
            await loadRoommates(data.propriete_id);
          }
        } else if (initialPropertyId) {
          // Charger les colocataires pour la propriété initiale en mode création
          await loadRoommates(initialPropertyId);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive",
        });
        navigate('/transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, id, isEditMode, setValue, navigate, initialPropertyId]);

  // Charger les colocataires lorsque la propriété change
  useEffect(() => {
    if (selectedPropertyId && !isEditMode) {
      loadRoommates(selectedPropertyId);
    }
  }, [selectedPropertyId, isEditMode]);

  const loadRoommates = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('colocataires_new')
        .select('*')
        .eq('propriete_id', propertyId)
        .order('nom');
      
      if (error) throw error;
      setRoommates(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des colocataires:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les colocataires.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: TransactionFormValues) => {
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
        // Mise à jour de la transaction
        const { error } = await supabase
          .from('transactions_new')
          .update({
            type: data.type,
            montant: data.montant,
            date: data.date,
            description: data.description || null,
            categorie: data.categorie || null,
            colocataire_id: data.colocataire_id || null,
            propriete_id: data.propriete_id,
            statut: data.statut,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Transaction mise à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        });
      } else {
        // Création d'une nouvelle transaction
        const { error } = await supabase
          .from('transactions_new')
          .insert({
            type: data.type,
            montant: data.montant,
            date: data.date,
            description: data.description || null,
            categorie: data.categorie || null,
            colocataire_id: data.colocataire_id || null,
            propriete_id: data.propriete_id,
            statut: data.statut,
          });
        
        if (error) throw error;
        
        toast({
          title: "Transaction ajoutée",
          description: "La transaction a été ajoutée avec succès.",
        });
      }
      
      navigate(`/transactions?propertyId=${data.propriete_id}`);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement de la transaction.",
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
          {isEditMode ? 'Modifier la transaction' : 'Ajouter une transaction'}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Modifier les informations' : 'Informations de la transaction'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Modifiez les informations de la transaction ci-dessous.' 
                : 'Remplissez les informations pour ajouter une nouvelle transaction.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propriete_id">Propriété*</Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(value) => setValue('propriete_id', value)}
                  disabled={properties.length === 0 || isEditMode}
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
                  <Label htmlFor="type">Type de transaction*</Label>
                  <Select
                    value={transactionType}
                    onValueChange={(value) => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenu">Revenu</SelectItem>
                      <SelectItem value="depense">Dépense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant (€)*</Label>
                  <Input
                    id="montant"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('montant', { 
                      required: 'Le montant est requis',
                      min: { value: 0, message: 'Le montant doit être positif' }
                    })}
                  />
                  {errors.montant && <p className="text-sm text-red-500">{errors.montant.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date de la transaction*</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'La date est requise' })}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Description de la transaction"
                  {...register('description')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={watch('categorie') || ''}
                  onValueChange={(value) => setValue('categorie', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionType === 'revenu' ? (
                      <>
                        <SelectItem value="loyer">Loyer</SelectItem>
                        <SelectItem value="caution">Caution</SelectItem>
                        <SelectItem value="remboursement">Remboursement</SelectItem>
                        <SelectItem value="autre">Autre revenu</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="charges">Charges</SelectItem>
                        <SelectItem value="travaux">Travaux</SelectItem>
                        <SelectItem value="equipement">Équipement</SelectItem>
                        <SelectItem value="assurance">Assurance</SelectItem>
                        <SelectItem value="taxe">Taxes</SelectItem>
                        <SelectItem value="autre">Autre dépense</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {transactionType === 'revenu' && (
                <div className="space-y-2">
                  <Label htmlFor="colocataire_id">Colocataire concerné</Label>
                  <Select
                    value={watch('colocataire_id') || ''}
                    onValueChange={(value) => setValue('colocataire_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un colocataire (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun colocataire</SelectItem>
                      {roommates.map((roommate) => (
                        <SelectItem key={roommate.id} value={roommate.id}>
                          {roommate.prenom} {roommate.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="statut">Statut de la transaction*</Label>
                <Select
                  value={watch('statut')}
                  onValueChange={(value) => setValue('statut', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complété">Complété</SelectItem>
                    <SelectItem value="en attente">En attente</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/transactions${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ''}`)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !selectedPropertyId}>
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Ajouter la transaction'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
