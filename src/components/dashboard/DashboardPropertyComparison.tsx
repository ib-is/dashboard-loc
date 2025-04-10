
import { useMemo } from 'react';
import { Property, Transaction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface DashboardPropertyComparisonProps {
  properties: Property[];
  transactions: Transaction[];
  detailed?: boolean;
}

export function DashboardPropertyComparison({ 
  properties, 
  transactions,
  detailed = false 
}: DashboardPropertyComparisonProps) {
  const comparisonData = useMemo(() => {
    // Skip if not enough properties
    if (properties.length <= 1) {
      return [];
    }
    
    return properties.map(property => {
      // Filter transactions for this property
      const propertyTransactions = transactions.filter(t => t.propriete_id === property.id);
      
      const revenues = propertyTransactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + Number(t.montant), 0);
      
      const expenses = propertyTransactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + Number(t.montant), 0);
      
      const balance = revenues - expenses;

      // Calculate ROI if possible
      let roi = null;
      if (property.prix_acquisition && property.prix_acquisition > 0) {
        roi = (balance / property.prix_acquisition) * 100;
      }
      
      return {
        name: property.nom,
        revenus: revenues,
        depenses: expenses,
        balance: balance,
        roi: roi
      };
    });
  }, [properties, transactions, detailed]);

  // If no comparison data, show message
  if (comparisonData.length <= 1) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">
          Ajoutez plus de propriétés pour comparer leurs performances
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name === 'revenus' && 'Revenus: '}
              {entry.name === 'depenses' && 'Dépenses: '}
              {entry.name === 'balance' && 'Balance: '}
              {entry.name === 'roi' && 'ROI: '}
              {entry.name === 'roi' 
                ? `${entry.value.toFixed(2)}%` 
                : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={comparisonData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="revenus" name="Revenus" fill="#10b981" />
        <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" />
        <Bar dataKey="balance" name="Balance" fill="#3b82f6" />
        {detailed && (
          <Bar dataKey="roi" name="ROI (%)" fill="#f59e0b" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
