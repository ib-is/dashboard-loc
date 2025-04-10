
import { useMemo } from 'react';
import { Property, Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface DashboardPerformanceProps {
  properties: Property[];
  transactions: Transaction[];
  selectedProperty: string;
  detailed?: boolean;
}

export function DashboardPerformance({ 
  properties, 
  transactions,
  selectedProperty,
  detailed = false
}: DashboardPerformanceProps) {
  const performanceData = useMemo(() => {
    // Filter properties if a specific one is selected
    const filteredProperties = selectedProperty === 'all' 
      ? properties 
      : properties.filter(p => p.id === selectedProperty);
    
    if (filteredProperties.length === 0) return null;
    
    // Calculate performance metrics for each property
    return filteredProperties.map(property => {
      // Filter transactions for this property
      const propertyTransactions = transactions.filter(t => t.propriete_id === property.id);
      const propertyRevenues = propertyTransactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + Number(t.montant), 0);
      
      const propertyExpenses = propertyTransactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + Number(t.montant), 0);
      
      const cashFlow = propertyRevenues - propertyExpenses;

      // Calculate ROI if we have acquisition price
      let roi = null;
      if (property.prix_acquisition && property.prix_acquisition > 0) {
        roi = (cashFlow / property.prix_acquisition) * 100;
      }
            
      return {
        propertyId: property.id,
        propertyName: property.nom,
        cashFlow,
        roi,
      };
    });
  }, [properties, transactions, selectedProperty]);

  // If no data, show empty state
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée à afficher</p>
      </div>
    );
  }

  // For simplified view, just show the key metrics
  if (!detailed) {
    return (
      <div className="space-y-4 h-full flex flex-col justify-center">
        {performanceData.map(property => (
          <div key={property.propertyId} className="space-y-2">
            {performanceData.length > 1 && (
              <h3 className="text-sm font-medium">{property.propertyName}</h3>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cash-flow</p>
                <p className={`text-lg font-medium ${property.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(property.cashFlow)}
                </p>
              </div>
              
              {property.roi !== null && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className={`text-lg font-medium ${property.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(property.roi)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // For detailed view, show more comprehensive charts
  return (
    <div className="space-y-4">
      {performanceData.map(property => (
        <div key={property.propertyId} className="space-y-2">
          {performanceData.length > 1 && (
            <h3 className="text-sm font-medium">{property.propertyName}</h3>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cash-flow</p>
              <p className={`text-lg font-medium ${property.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(property.cashFlow)}
              </p>
            </div>
            
            {property.roi !== null && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className={`text-lg font-medium ${property.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(property.roi)}
                </p>
              </div>
            )}
            
            {/* Additional metrics would go here for PRO version */}
          </div>
        </div>
      ))}
    </div>
  );
}
