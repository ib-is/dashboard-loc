
import { Property, Transaction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DashboardCashFlow } from '@/components/dashboard/DashboardCashFlow';
import { DashboardPerformance } from '@/components/dashboard/DashboardPerformance';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import { DashboardPropertyComparison } from '@/components/dashboard/DashboardPropertyComparison';
import { DashboardReports } from '@/components/dashboard/DashboardReports';
import { useNavigate } from 'react-router-dom';

interface ProAccountDashboardProps {
  properties: Property[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  selectedProperty: string;
}

export function ProAccountDashboard({ 
  properties, 
  transactions, 
  filteredTransactions, 
  selectedProperty 
}: ProAccountDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Analyse détaillée (12 mois)</CardTitle>
          <CardDescription>
            Évolution de vos revenus et dépenses sur les 12 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <DashboardCashFlow 
            transactions={filteredTransactions} 
            months={12}
            selectedProperty={selectedProperty}
            showPredictions={true}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des biens</CardTitle>
          <CardDescription>
            Performance relative de vos propriétés
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <DashboardPropertyComparison 
            properties={properties} 
            transactions={transactions}
            detailed={true}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance détaillée</CardTitle>
          <CardDescription>
            Analyses approfondies de rentabilité
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <DashboardPerformance 
            properties={properties}
            transactions={transactions}
            selectedProperty={selectedProperty}
            detailed={true}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Alertes importantes</CardTitle>
          <CardDescription>
            Paiements en retard et actions nécessaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardAlerts 
            properties={properties} 
            transactions={transactions}
            detailed={true}
            onAddPayment={(propertyId, roomateId) => 
              navigate(`/transactions/new?propertyId=${propertyId}&colocataireId=${roomateId}&type=revenu&categorie=loyer`)}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Rapports</CardTitle>
          <CardDescription>
            Générez des documents et rapports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardReports 
            properties={properties} 
            transactions={transactions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
