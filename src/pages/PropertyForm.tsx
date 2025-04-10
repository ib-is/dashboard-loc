
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from '@/components/Layout';
import { useForm } from 'react-hook-form';

interface PropertyFormValues {
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  type: string;
  nombre_chambres: number;
  statut: string;
}

export default function PropertyForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PropertyFormValues>({
    defaultValues: {
      nom: '',
      adresse: '',
      ville: '',
      code_postal: '',
      pays: 'France',
      type: 'appartement',
      nombre_chambres: 1,
      statut: 'actif',
    }
  });

  const typeProperty = watch('type');
  const statutProperty = watch('statut');

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProperty = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('proprietes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setValue('nom', data.nom);
            setValue('adresse', data.adresse);
            setValue('ville', data.ville);
            setValue('code_postal', data.code_postal);
            setValue('pays', data.pays);
            setValue('type', data.type);
            setValue('nombre_chambres', data.nombre_chambres);
            setValue('statut', data.statut);
          }
        } catch (error: any) {
          console.error('Erreur lors du chargement de la propriété:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les détails de la propriété.",
            variant: "destructive",
          });
          navigate('/properties');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProperty();
    }
  }, [id, isEditMode, setValue, navigate]);

  const onSubmit = async (data: PropertyFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        // Mise à jour de la propriété
        const { error } = await supabase
          .from('proprietes')
          .update({
            nom: data.nom,
            adresse: data.adresse,
            ville: data.ville,
            code_postal: data.code_postal,
            pays: data.pays,
            type: data.type,
            nombre_chambres: data.nombre_chambres,
            statut: data.statut,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Propriété mise à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        });
      } else {
        // Création d'une nouvelle propriété
        const { error } = await supabase
          .from('proprietes')
          .insert({
            user_id: user.id,
            nom: data.nom,
            adresse: data.adresse,
            ville: data.ville,
            code_postal: data.code_postal,
            pays: data.pays,
            type: data.type,
            nombre_chambres: data.nombre_chambres,
            statut: data.statut,
          });
        
        if (error) {
          if (error.message.includes('Limite de propriétés atteinte')) {
            toast({
              title: "Limite atteinte",
              description: "Vous avez atteint la limite de propriétés pour votre niveau de compte. Veuillez mettre à niveau votre compte pour ajouter plus de propriétés.",
              variant: "destructive",
            });
            navigate('/profile');
            return;
          }
          throw error;
        }
        
        toast({
          title: "Propriété créée",
          description: "La propriété a été ajoutée avec succès.",
        });
      }
      
      navigate('/properties');
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la propriété:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement de la propriété.",
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
          {isEditMode ? 'Modifier la propriété' : 'Ajouter une propriété'}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Modifier les informations' : 'Informations de la propriété'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Modifiez les informations de votre propriété ci-dessous.' 
                : 'Remplissez les informations pour ajouter une nouvelle propriété.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la propriété*</Label>
                <Input
                  id="nom"
                  placeholder="Appartement Paris 11ème"
                  {...register('nom', { required: 'Le nom est requis' })}
                />
                {errors.nom && <p className="text-sm text-red-500">{errors.nom.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse*</Label>
                <Input
                  id="adresse"
                  placeholder="12 rue de la Paix"
                  {...register('adresse', { required: 'L\'adresse est requise' })}
                />
                {errors.adresse && <p className="text-sm text-red-500">{errors.adresse.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville*</Label>
                  <Input
                    id="ville"
                    placeholder="Paris"
                    {...register('ville', { required: 'La ville est requise' })}
                  />
                  {errors.ville && <p className="text-sm text-red-500">{errors.ville.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code_postal">Code postal*</Label>
                  <Input
                    id="code_postal"
                    placeholder="75011"
                    {...register('code_postal', { required: 'Le code postal est requis' })}
                  />
                  {errors.code_postal && <p className="text-sm text-red-500">{errors.code_postal.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pays">Pays*</Label>
                <Input
                  id="pays"
                  placeholder="France"
                  {...register('pays', { required: 'Le pays est requis' })}
                />
                {errors.pays && <p className="text-sm text-red-500">{errors.pays.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de propriété*</Label>
                  <Select
                    value={typeProperty}
                    onValueChange={(value) => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nombre_chambres">Nombre de chambres*</Label>
                  <Input
                    id="nombre_chambres"
                    type="number"
                    min="1"
                    {...register('nombre_chambres', { 
                      required: 'Le nombre de chambres est requis',
                      min: { value: 1, message: 'Minimum 1 chambre' }
                    })}
                  />
                  {errors.nombre_chambres && <p className="text-sm text-red-500">{errors.nombre_chambres.message}</p>}
                </div>
              </div>
              
              {isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut de la propriété*</Label>
                  <Select
                    value={statutProperty}
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
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/properties')}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Ajouter la propriété'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
