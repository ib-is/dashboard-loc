
import { useMemo } from 'react';
import { Transaction } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/utils/formatters';

interface DashboardCashFlowProps {
  transactions: Transaction[];
  months: number;
  selectedProperty: string;
  showPredictions?: boolean;
}

export function DashboardCashFlow({ 
  transactions, 
  months, 
  selectedProperty,
  showPredictions = false 
}: DashboardCashFlowProps) {
  const chartData = useMemo(() => {
    // Generate array of last N months
    const today = new Date();
    const monthsArray = Array.from({ length: months }, (_, i) => {
      const date = subMonths(today, months - i - 1);
      return {
        name: format(date, 'MMM yyyy', { locale: fr }),
        month: format(date, 'yyyy-MM'),
        revenus: 0,
        depenses: 0,
        balance: 0,
        // Add prediction fields if needed
        revenus_prevision: 0,
        depenses_prevision: 0,
        balance_prevision: 0,
      };
    });

    // Calculate total revenues and expenses for each month
    transactions.forEach(transaction => {
      const transactionDate = parseISO(transaction.date);
      const monthIndex = monthsArray.findIndex(
        m => m.month === format(transactionDate, 'yyyy-MM')
      );
      
      if (monthIndex !== -1) {
        const amount = Number(transaction.montant);
        if (transaction.type === 'revenu') {
          monthsArray[monthIndex].revenus += amount;
        } else {
          monthsArray[monthIndex].depenses += amount;
        }
      }
    });

    // Calculate balance for each month
    monthsArray.forEach(month => {
      month.balance = month.revenus - month.depenses;
    });

    // Add predictions if enabled
    if (showPredictions) {
      // Get average of last 3 months for predictions
      const lastThreeMonths = monthsArray.slice(-4, -1);
      const avgRevenue = lastThreeMonths.reduce((sum, m) => sum + m.revenus, 0) / lastThreeMonths.length;
      const avgExpense = lastThreeMonths.reduce((sum, m) => sum + m.depenses, 0) / lastThreeMonths.length;
      
      // Add slight growth for predictions (5% for revenue, 3% for expenses)
      monthsArray[monthsArray.length - 1].revenus_prevision = monthsArray[monthsArray.length - 1].revenus * 0.5 + avgRevenue * 1.05 * 0.5;
      monthsArray[monthsArray.length - 1].depenses_prevision = monthsArray[monthsArray.length - 1].depenses * 0.5 + avgExpense * 1.03 * 0.5;
      monthsArray[monthsArray.length - 1].balance_prevision = 
        monthsArray[monthsArray.length - 1].revenus_prevision - 
        monthsArray[monthsArray.length - 1].depenses_prevision;
        
      // Add next 2 months prediction
      for (let i = 1; i <= 2; i++) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + i);
        
        const prevRevenue = i === 1 
          ? monthsArray[monthsArray.length - 1].revenus_prevision 
          : monthsArray[monthsArray.length].revenus_prevision;
          
        const prevExpense = i === 1 
          ? monthsArray[monthsArray.length - 1].depenses_prevision 
          : monthsArray[monthsArray.length].depenses_prevision;
        
        const nextRevenue = prevRevenue * 1.05;
        const nextExpense = prevExpense * 1.03;
        
        monthsArray.push({
          name: format(nextMonth, 'MMM yyyy', { locale: fr }),
          month: format(nextMonth, 'yyyy-MM'),
          revenus: 0,
          depenses: 0,
          balance: 0,
          revenus_prevision: nextRevenue,
          depenses_prevision: nextExpense,
          balance_prevision: nextRevenue - nextExpense
        });
      }
    }

    return monthsArray;
  }, [transactions, months, showPredictions]);

  // If no data, show empty state
  if (transactions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée à afficher</p>
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
              {entry.name === 'revenus_prevision' && 'Revenus (prévision): '}
              {entry.name === 'depenses_prevision' && 'Dépenses (prévision): '}
              {entry.name === 'balance_prevision' && 'Balance (prévision): '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
          {showPredictions && (
            <>
              <linearGradient id="colorRevenuePrediction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorExpensePrediction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorBalancePrediction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value} €`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenus" 
          name="Revenus"
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
        <Area 
          type="monotone" 
          dataKey="depenses" 
          name="Dépenses"
          stroke="#ef4444" 
          fillOpacity={1} 
          fill="url(#colorExpense)" 
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          name="Balance"
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorBalance)" 
        />
        {showPredictions && (
          <>
            <Area 
              type="monotone" 
              dataKey="revenus_prevision" 
              name="Revenus (prévision)"
              stroke="#10b981" 
              strokeDasharray="5 5"
              fillOpacity={0.3} 
              fill="url(#colorRevenuePrediction)" 
            />
            <Area 
              type="monotone" 
              dataKey="depenses_prevision" 
              name="Dépenses (prévision)"
              stroke="#ef4444" 
              strokeDasharray="5 5"
              fillOpacity={0.3} 
              fill="url(#colorExpensePrediction)" 
            />
            <Area 
              type="monotone" 
              dataKey="balance_prevision" 
              name="Balance (prévision)"
              stroke="#3b82f6" 
              strokeDasharray="5 5"
              fillOpacity={0.3} 
              fill="url(#colorBalancePrediction)" 
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
