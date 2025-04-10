
import { Transaction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface DashboardStatsProps {
  transactions: Transaction[];
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  // Calculate totals for basic summary
  const totalRevenues = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + Number(t.montant), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + Number(t.montant), 0);
  
  const balance = totalRevenues - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenues)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
          <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <BarChart className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
