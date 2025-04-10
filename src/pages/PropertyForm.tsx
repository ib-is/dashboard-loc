
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
import { Info } from 'lucide-react';

export default function PropertyForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    type: 'appartement',
    nombre_chambres: 1,
    statut: 'actif',
    prix_acquisition: '',
    credit_mensuel: '',
    jour_prelevement_credit: '',
    date_debut_credit: '',
    date_fin_credit: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [showMortgageFields, setShowMortgageFields] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Si on est en mode édition, récupérer les données de la propriété
        if (isEditMode && id) {
          const { data: property, error } = await supabase
            .from('proprietes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          // Set mortgage fields visibility based on presence of values
          const hasMortgageData = property.prix_acquisition || 
                                  property.credit_mensuel || 
                                  property.date_debut_credit;
          
          setShowMortgageFields(hasMortgageData);
          
          setFormData({
            nom: property.nom,
            adresse: property.adresse,
            ville: property.ville,
            code_postal: property.code_postal,
            pays: property.pays,
            type: property.type,
            nombre_chambres: property.nombre_chambres,
            statut: property.statut,
            prix_acquisition: property.prix_acquisition?.toString() || '',
            credit_mensuel: property.credit_mensuel?.toString() || '',
            jour_prelevement_credit: property.jour_prelevement_credit?.toString() || '',
            date_debut_credit: property.date_debut_credit || '',
            date_fin_credit: property.date_fin_credit || '',
          });
        }
        
        // Récupérer le nombre de propriétés pour la vérification de limite
        const { data: properties, error: countError } = await supabase
          .from('proprietes')
          .select('id')
          .eq('user_id', user.id);
        
        if (countError) throw countError;
        setPropertiesCount(isEditMode ? properties.length - 1 : properties.length);
        
      } catch (error: any) {
        console.error('Error fetching property data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, id, isEditMode]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }
    
    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est requise';
    }
    
    if (!formData.code_postal.trim()) {
      newErrors.code_postal = 'Le code postal est requis';
    }
    
    if (showMortgageFields) {
      if (formData.credit_mensuel && !formData.date_debut_credit) {
        newErrors.date_debut_credit = 'La date de début du crédit est requise';
      }
      
      if (formData.credit_mensuel && !formData.jour_prelevement_credit) {
        newErrors.jour_prelevement_credit = 'Le jour de prélèvement est requis';
      }
      
      if (formData.jour_prelevement_credit) {
        const jour = parseInt(formData.jour_prelevement_credit);
        if (isNaN(jour) || jour < 1 || jour > 31) {
          newErrors.jour_prelevement_credit = 'Le jour doit être entre 1 et 31';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;
    
    // Vérifier la limite de propriétés en fonction du niveau du compte
    if (!isEditMode) {
      const { data: userProfile, error: profileError } = await supabase
        .from('profils')
        .select('niveau_compte')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier votre niveau de compte.",
          variant: "destructive",
        });
        return;
      }
      
      const niveau = userProfile.niveau_compte;
      
      if (niveau === 'free' && propertiesCount >= 1) {
        toast({
          title: "Limite atteinte",
          description: "Votre compte gratuit est limité à 1 propriété. Passez à un niveau supérieur pour en ajouter davantage.",
          variant: "destructive",
        });
        return;
      } else if (niveau === 'plus' && propertiesCount >= 3) {
        toast({
          title: "Limite atteinte",
          description: "Votre compte Plus est limité à 3 propriétés. Passez au niveau Pro pour en ajouter davantage.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Convertir les valeurs numériques
      const dataToSend = {
        nom: formData.nom,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.code_postal,
        pays: formData.pays,
        type: formData.type,
        nombre_chambres: parseInt(formData.nombre_chambres.toString()),
        statut: formData.statut,
        user_id: user.id,
        prix_acquisition: formData.prix_acquisition ? parseFloat(formData.prix_acquisition) : null,
        credit_mensuel: formData.credit_mensuel ? parseFloat(formData.credit_mensuel) : null,
        jour_prelevement_credit: formData.jour_prelevement_credit ? parseInt(formData.jour_prelevement_credit) : null,
        date_debut_credit: formData.date_debut_credit || null,
        date_fin_credit: formData.date_fin_credit || null,
      };
      
      if (isEditMode && id) {
        // Mode édition
        const { error } = await supabase
          .from('proprietes')
          .update({
            ...dataToSend,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Propriété mise à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        });
      } else {
        // Mode création
        const { error } = await supabase
          .from('proprietes')
          .insert(dataToSend);
        
        if (error) throw error;
        
        toast({
          title: "Propriété ajoutée",
          description: "La propriété a été ajoutée avec succès.",
        });
      }
      
      navigate('/properties');
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement.",
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
                ? 'Modifiez les informations de la propriété ci-dessous.' 
                : 'Remplissez les informations pour ajouter une nouvelle propriété.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la propriété*</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="ex: Appartement Paris 11"
                />
                {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse*</Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="ex: 42 rue de la Paix"
                />
                {errors.adresse && <p className="text-sm text-red-500">{errors.adresse}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville*</Label>
                  <Input
                    id="ville"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    placeholder="ex: Paris"
                  />
                  {errors.ville && <p className="text-sm text-red-500">{errors.ville}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code_postal">Code postal*</Label>
                  <Input
                    id="code_postal"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleChange}
                    placeholder="ex: 75011"
                  />
                  {errors.code_postal && <p className="text-sm text-red-500">{errors.code_postal}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pays">Pays</Label>
                <Input
                  id="pays"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  placeholder="ex: France"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de bien</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nombre_chambres">Nombre de chambres</Label>
                  <Input
                    id="nombre_chambres"
                    name="nombre_chambres"
                    type="number"
                    min="0"
                    value={formData.nombre_chambres}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  name="statut"
                  value={formData.statut}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value }))}
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
              
              {/* Toggle for mortgage info */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium">Informations sur le crédit</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMortgageFields(!showMortgageFields)}
                  >
                    {showMortgageFields ? 'Masquer' : 'Afficher'}
                  </Button>
                </div>
                
                {showMortgageFields && (
                  <div className="mt-4 space-y-4 bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="space-y-2">
                      <Label htmlFor="prix_acquisition">Prix d'acquisition (€)</Label>
                      <Input
                        id="prix_acquisition"
                        name="prix_acquisition"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix_acquisition}
                        onChange={handleChange}
                        placeholder="ex: 150000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="credit_mensuel">Mensualité du crédit (€)</Label>
                      <Input
                        id="credit_mensuel"
                        name="credit_mensuel"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.credit_mensuel}
                        onChange={handleChange}
                        placeholder="ex: 800"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jour_prelevement_credit">Jour de prélèvement</Label>
                        <Input
                          id="jour_prelevement_credit"
                          name="jour_prelevement_credit"
                          type="number"
                          min="1"
                          max="31"
                          value={formData.jour_prelevement_credit}
                          onChange={handleChange}
                          placeholder="ex: 15"
                        />
                        {errors.jour_prelevement_credit && <p className="text-sm text-red-500">{errors.jour_prelevement_credit}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="date_debut_credit">Date de début du crédit</Label>
                        <Input
                          id="date_debut_credit"
                          name="date_debut_credit"
                          type="date"
                          value={formData.date_debut_credit}
                          onChange={handleChange}
                        />
                        {errors.date_debut_credit && <p className="text-sm text-red-500">{errors.date_debut_credit}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_fin_credit">Date de fin du crédit (optionnel)</Label>
                      <Input
                        id="date_fin_credit"
                        name="date_fin_credit"
                        type="date"
                        value={formData.date_fin_credit}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
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
