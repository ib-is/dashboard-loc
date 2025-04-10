
import React, { useState, useMemo } from 'react';
import { Property, Roommate, Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionItem from './TransactionItem';
import RoommatePaymentStatus from './RoommatePaymentStatus';

interface MonthlyTransactionsProps {
  transactions: Transaction[];
  properties: Property[];
  roommates: Roommate[];
  selectedPropertyId: string | null;
  onNavigateToTransactionForm: (colocataireId?: string) => void;
}

// Helper function to group transactions by month
const groupTransactionsByMonth = (transactions: Transaction[]) => {
  const grouped: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    
    grouped[monthKey].push(transaction);
  });
  
  // Sort months in descending order (newest first)
  return Object.entries(grouped)
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    .map(([key, transactions]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        key,
        monthName: new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });
};

// Helper function to group transactions by roommate
const groupTransactionsByRoommate = (transactions: Transaction[], roommates: Roommate[]) => {
  const grouped: Record<string, Transaction[]> = { 'none': [] };
  
  roommates.forEach(roommate => {
    grouped[roommate.id] = [];
  });
  
  transactions.forEach(transaction => {
    if (transaction.colocataire_id) {
      if (!grouped[transaction.colocataire_id]) {
        grouped[transaction.colocataire_id] = [];
      }
      grouped[transaction.colocataire_id].push(transaction);
    } else {
      grouped['none'].push(transaction);
    }
  });
  
  return grouped;
};

const MonthlyTransactions: React.FC<MonthlyTransactionsProps> = ({
  transactions,
  properties,
  roommates,
  selectedPropertyId,
  onNavigateToTransactionForm
}) => {
  const groupedByMonth = useMemo(() => groupTransactionsByMonth(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState<string>(groupedByMonth.length > 0 ? groupedByMonth[0].key : '');
  
  const currentMonthTransactions = useMemo(() => {
    const month = groupedByMonth.find(m => m.key === selectedMonth);
    return month ? month.transactions : [];
  }, [groupedByMonth, selectedMonth]);
  
  const roommatesToDisplay = useMemo(() => 
    roommates.filter(r => r.propriete_id === selectedPropertyId), 
    [roommates, selectedPropertyId]
  );
  
  const transactionsByRoommate = useMemo(() => 
    groupTransactionsByRoommate(currentMonthTransactions, roommatesToDisplay), 
    [currentMonthTransactions, roommatesToDisplay]
  );
  
  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const revenues = currentMonthTransactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + Number(t.montant), 0);
      
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + Number(t.montant), 0);
      
    return {
      revenues,
      expenses,
      balance: revenues - expenses
    };
  }, [currentMonthTransactions]);
  
  // Calculate payment status for each roommate
  const roommatePaymentStatus = useMemo(() => {
    const status: Record<string, { paid: boolean, amount: number }> = {};
    
    roommatesToDisplay.forEach(roommate => {
      // Check if there's a "loyer" payment for this month
      const hasRentPayment = transactionsByRoommate[roommate.id]?.some(
        t => t.type === 'revenu' && 
        (t.categorie === 'loyer' || t.description?.toLowerCase().includes('loyer')) &&
        t.statut === 'complété'
      );
      
      status[roommate.id] = {
        paid: hasRentPayment,
        amount: roommate.montant_loyer
      };
    });
    
    return status;
  }, [roommatesToDisplay, transactionsByRoommate]);
  
  if (groupedByMonth.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Aucune transaction pour cette propriété.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Sélectionnez un mois" />
            </SelectTrigger>
            <SelectContent>
              {groupedByMonth.map((month) => (
                <SelectItem key={month.key} value={month.key}>
                  {month.monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Month totals */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="font-medium text-green-600">{monthlyTotals.revenues.toFixed(2)} €</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-600">{monthlyTotals.expenses.toFixed(2)} €</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Balance:</span>
            <span className={`font-medium ${monthlyTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyTotals.balance.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
      
      {/* Roommate Payment Status */}
      {roommatesToDisplay.length > 0 && (
        <RoommatePaymentStatus 
          roommates={roommatesToDisplay}
          paymentStatus={roommatePaymentStatus}
          onAddPayment={onNavigateToTransactionForm}
        />
      )}
      
      {/* Group by Roommate */}
      <div className="space-y-4">
        {roommatesToDisplay.map(roommate => {
          const roommateTransactions = transactionsByRoommate[roommate.id] || [];
          if (roommateTransactions.length === 0) return null;
          
          return (
            <div key={roommate.id} className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                {roommate.prenom} {roommate.nom}
              </h3>
              <div className="space-y-1">
                {roommateTransactions.map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} roommates={roommates} />
                ))}
              </div>
            </div>
          );
        })}
        
        {transactionsByRoommate['none']?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              Autres transactions
            </h3>
            <div className="space-y-1">
              {transactionsByRoommate['none'].map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} roommates={roommates} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTransactions;
