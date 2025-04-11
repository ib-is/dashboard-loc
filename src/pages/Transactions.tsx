
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, Property, Roommate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, Filter, ArrowUp, ArrowDown, Calendar, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyTransactions from '@/components/transactions/MonthlyTransactions';

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPropertyId = queryParams.get('propertyId');
  const isMobile = useIsMobile();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(initialPropertyId);
  const [loading, setLoading] = useState(true);
  
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id)
          .order('nom');
        
        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);
        
        if (!selectedPropertyId && propertiesData && propertiesData.length > 0) {
          setSelectedPropertyId(propertiesData[0].id);
        }
        
        if (selectedPropertyId) {
          const { data: roommatesData, error: roommatesError } = await supabase
            .from('colocataires_new')
            .select('*')
            .eq('propriete_id', selectedPropertyId);
          
          if (roommatesError) throw roommatesError;
          setRoommates(roommatesData || []);
          
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions_new')
            .select('*')
            .eq('propriete_id', selectedPropertyId)
            .order('date', { ascending: false });
          
          if (transactionsError) throw transactionsError;
          setTransactions(transactionsData || []);
        } else {
          setRoommates([]);
          setTransactions([]);
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
    navigate(`/transactions?propertyId=${propertyId}`, { replace: true });
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions_new')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      
      toast({
        title: "Transaction supprimée",
        description: "La transaction a été supprimée avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction.",
        variant: "destructive",
      });
    }
  };

  const handleTypeFilterChange = (type: string) => {
    if (typeFilter.includes(type)) {
      setTypeFilter(typeFilter.filter(t => t !== type));
    } else {
      setTypeFilter([...typeFilter, type]);
    }
  };

  const resetFilters = () => {
    setTypeFilter([]);
    setDateRangeStart('');
    setDateRangeEnd('');
    setSearchTerm('');
  };

  const handleNavigateToTransactionForm = useCallback((colocataireId?: string) => {
    if (!selectedPropertyId) return;
    
    const baseUrl = `/transactions/new?propertyId=${selectedPropertyId}`;
    
    if (colocataireId) {
      const roommate = roommates.find(r => r.id === colocataireId);
      if (roommate) {
        navigate(`${baseUrl}&colocataireId=${colocataireId}&type=revenu&categorie=loyer&montant=${roommate.montant_loyer}`);
        return;
      }
    }
    
    navigate(baseUrl);
  }, [selectedPropertyId, navigate, roommates]);

  const filteredTransactions = transactions.filter(transaction => {
    if (typeFilter.length > 0 && !typeFilter.includes(transaction.type)) {
      return false;
    }
    
    if (dateRangeStart && new Date(transaction.date) < new Date(dateRangeStart)) {
      return false;
    }
    
    if (dateRangeEnd && new Date(transaction.date) > new Date(dateRangeEnd)) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.categorie?.toLowerCase().includes(searchLower) ||
        transaction.montant.toString().includes(searchLower)
      );
    }
    
    return true;
  });

  const totalRevenues = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + Number(t.montant), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + Number(t.montant), 0);
  
  const balance = totalRevenues - totalExpenses;

  return (
    <Layout>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Transactions</h1>
          
          {/* Property selector and add button */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="w-full md:w-[250px]">
              <Select
                value={selectedPropertyId || ''}
                onValueChange={handlePropertyChange}
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
            </div>
            
            {selectedPropertyId && (
              <Button onClick={() => handleNavigateToTransactionForm()}>
                <Plus className="mr-2 h-4 w-4" /> 
                {!isMobile && "Ajouter une transaction"}
                {isMobile && "Ajouter"}
              </Button>
            )}
          </div>
        </div>
        
        {/* Search bar for mobile - togglable */}
        {isMobile && (
          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="flex-1">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="flex-1 flex justify-between items-center"
                onClick={() => setIsSearchOpen(true)}
              >
                <span>Rechercher</span>
                <Search className="h-4 w-4" />
              </Button>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrer par type</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="revenu-mobile"
                      checked={typeFilter.includes('revenu')}
                      onCheckedChange={() => handleTypeFilterChange('revenu')}
                    />
                    <Label htmlFor="revenu-mobile" className="flex items-center gap-1">
                      <ArrowUp className="h-4 w-4 text-green-500" /> Revenus
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="depense-mobile"
                      checked={typeFilter.includes('depense')}
                      onCheckedChange={() => handleTypeFilterChange('depense')}
                    />
                    <Label htmlFor="depense-mobile" className="flex items-center gap-1">
                      <ArrowDown className="h-4 w-4 text-red-500" /> Dépenses
                    </Label>
                  </div>
                  
                  <h4 className="font-medium">Plage de dates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="date-start-mobile">Début</Label>
                      <Input
                        id="date-start-mobile"
                        type="date"
                        value={dateRangeStart}
                        onChange={(e) => setDateRangeStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="date-end-mobile">Fin</Label>
                      <Input
                        id="date-end-mobile"
                        type="date"
                        value={dateRangeEnd}
                        onChange={(e) => setDateRangeEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                    Réinitialiser les filtres
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {isSearchOpen && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchTerm('');
                }}
              >
                <ArrowDown className="h-4 w-4 rotate-45" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {properties.length === 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aucune propriété trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Vous devez d'abord créer une propriété avant de pouvoir ajouter des transactions.
            </p>
            <Button onClick={() => navigate('/properties/new')}>
              Ajouter une propriété
            </Button>
          </CardContent>
        </Card>
      ) : selectedPropertyId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenus totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalRevenues.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} €</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance.toFixed(2)} €
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="monthly">Vue mensuelle</TabsTrigger>
                <TabsTrigger value="all">Toutes les transactions</TabsTrigger>
              </TabsList>
              
              {!isMobile && (
                <div className="flex gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-[200px]"
                  />
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex gap-2">
                        <Filter className="h-4 w-4" />
                        Filtres
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filtrer par type</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="revenu"
                            checked={typeFilter.includes('revenu')}
                            onCheckedChange={() => handleTypeFilterChange('revenu')}
                          />
                          <Label htmlFor="revenu" className="flex items-center gap-1">
                            <ArrowUp className="h-4 w-4 text-green-500" /> Revenus
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="depense"
                            checked={typeFilter.includes('depense')}
                            onCheckedChange={() => handleTypeFilterChange('depense')}
                          />
                          <Label htmlFor="depense" className="flex items-center gap-1">
                            <ArrowDown className="h-4 w-4 text-red-500" /> Dépenses
                          </Label>
                        </div>
                        
                        <h4 className="font-medium">Plage de dates</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="date-start">Début</Label>
                            <Input
                              id="date-start"
                              type="date"
                              value={dateRangeStart}
                              onChange={(e) => setDateRangeStart(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="date-end">Fin</Label>
                            <Input
                              id="date-end"
                              type="date"
                              value={dateRangeEnd}
                              onChange={(e) => setDateRangeEnd(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                          Réinitialiser les filtres
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <>
                <TabsContent value="monthly" className="mt-4">
                  <MonthlyTransactions
                    transactions={filteredTransactions}
                    properties={properties}
                    roommates={roommates}
                    selectedPropertyId={selectedPropertyId}
                    onNavigateToTransactionForm={handleNavigateToTransactionForm}
                  />
                </TabsContent>
                
                <TabsContent value="all" className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-left p-3 font-medium">Montant</th>
                          {!isMobile && (
                            <th className="text-left p-3 font-medium">Colocataire</th>
                          )}
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => {
                          const roommate = roommates.find(r => r.id === transaction.colocataire_id);
                          
                          return (
                            <tr key={transaction.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                {new Date(transaction.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center">
                                  {transaction.type === 'revenu' ? (
                                    <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                                  ) : (
                                    <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                                  )}
                                  {!isMobile && (transaction.type === 'revenu' ? 'Revenu' : 'Dépense')}
                                </div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{transaction.description || '-'}</p>
                                  {transaction.categorie && (
                                    <p className="text-xs text-muted-foreground">{transaction.categorie}</p>
                                  )}
                                  {isMobile && roommate && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {roommate.prenom} {roommate.nom}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className={`p-3 font-medium ${transaction.type === 'revenu' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'revenu' ? '+' : '-'}{Number(transaction.montant).toFixed(2)} €
                              </td>
                              {!isMobile && (
                                <td className="p-3">
                                  {roommate ? `${roommate.prenom} ${roommate.nom}` : '-'}
                                </td>
                              )}
                              <td className="p-3 text-right">
                                <div className="flex justify-end items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
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
                                        <AlertDialogTitle>Supprimer la transaction</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteTransaction(transaction.id)}
                                          className="bg-red-500 hover:bg-red-600"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Aucune transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Vous n'avez pas encore ajouté de transaction pour cette propriété.
                  </p>
                  <Button onClick={() => handleNavigateToTransactionForm()}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une transaction
                  </Button>
                </CardContent>
              </Card>
            )}
          </Tabs>
        </>
      )}
    </Layout>
  );
}
