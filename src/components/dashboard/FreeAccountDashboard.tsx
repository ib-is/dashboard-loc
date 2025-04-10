
import { Property } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, PieChart, BarChart, AlertTriangle, FileText } from 'lucide-react';

interface FreeAccountDashboardProps {
  properties: Property[];
}

export function FreeAccountDashboard({ properties }: FreeAccountDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="mt-4">
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
        <>
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
        </>
      )}
    </div>
  );
}
