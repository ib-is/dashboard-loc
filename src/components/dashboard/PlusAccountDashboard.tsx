
import { Property, Transaction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DashboardCashFlow } from '@/components/dashboard/DashboardCashFlow';
import { DashboardPerformance } from '@/components/dashboard/DashboardPerformance';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import { DashboardPropertyComparison } from '@/components/dashboard/DashboardPropertyComparison';
import { useNavigate } from 'react-router-dom';

interface PlusAccountDashboardProps {
  properties: Property[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  selectedProperty: string;
}

export function PlusAccountDashboard({ 
  properties, 
  transactions, 
  filteredTransactions, 
  selectedProperty 
}: PlusAccountDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Cash-flow sur 6 mois</CardTitle>
          <CardDescription>
            Évolution de vos revenus et dépenses sur les 6 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <DashboardCashFlow 
            transactions={filteredTransactions} 
            months={6} 
            selectedProperty={selectedProperty}
          />
        </CardContent>
      </Card>
      
      {properties.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des biens</CardTitle>
            <CardDescription>
              Performance relative de vos propriétés
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <DashboardPropertyComparison 
              properties={properties} 
              transactions={transactions}
            />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Indicateurs de performance</CardTitle>
          <CardDescription>
            Taux d'occupation, ROI, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <DashboardPerformance 
            properties={properties}
            transactions={transactions}
            selectedProperty={selectedProperty}
          />
        </CardContent>
      </Card>
      
      <Card className={properties.length > 1 ? "md:col-span-2" : ""}>
        <CardHeader>
          <CardTitle>Alertes</CardTitle>
          <CardDescription>
            Paiements en retard et actions nécessaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardAlerts 
            properties={properties} 
            transactions={transactions}
            onAddPayment={(propertyId, roomateId) => 
              navigate(`/transactions/new?propertyId=${propertyId}&colocataireId=${roomateId}&type=revenu&categorie=loyer`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
