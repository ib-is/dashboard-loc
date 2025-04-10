
import React from 'react';
import { Transaction, Roommate } from '@/types';
import { ArrowUp, ArrowDown, Calendar, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  roommates: Roommate[];
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, roommates }) => {
  const roommate = transaction.colocataire_id 
    ? roommates.find(r => r.id === transaction.colocataire_id) 
    : null;
  
  const isRevenue = transaction.type === 'revenu';
  
  const statusStyles = {
    'complété': 'bg-green-100 text-green-800',
    'en attente': 'bg-yellow-100 text-yellow-800',
    'annulé': 'bg-red-100 text-red-800'
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-md border",
      transaction.est_automatique ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200",
      "hover:bg-gray-50"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          isRevenue ? "bg-green-100" : "bg-red-100"
        )}>
          {isRevenue ? (
            <ArrowUp className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        <div>
          <div className="font-medium">
            {transaction.description || (isRevenue ? 'Revenu' : 'Dépense')}
            {transaction.est_automatique && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Auto</span>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(transaction.date).toLocaleDateString('fr-FR')}
            </div>
            
            {transaction.categorie && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {transaction.categorie}
              </div>
            )}
            
            {roommate && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {roommate.prenom} {roommate.nom}
              </div>
            )}
            
            <div className={cn("text-xs px-1.5 py-0.5 rounded-full", statusStyles[transaction.statut as keyof typeof statusStyles])}>
              {transaction.statut}
            </div>
          </div>
        </div>
      </div>
      
      <div className={cn(
        "font-semibold",
        isRevenue ? "text-green-600" : "text-red-600"
      )}>
        {isRevenue ? '+' : '-'}{Number(transaction.montant).toFixed(2)} €
      </div>
    </div>
  );
};

export default TransactionItem;
