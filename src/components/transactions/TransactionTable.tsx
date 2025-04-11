
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, Roommate } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
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

interface TransactionTableProps {
  transactions: Transaction[];
  roommates: Roommate[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  roommates,
  onDeleteTransaction
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Montant</TableHead>
            {!isMobile && (
              <TableHead>Colocataire</TableHead>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const roommate = roommates.find(r => r.id === transaction.colocataire_id);
            
            return (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {transaction.type === 'revenu' ? (
                      <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    {!isMobile && (transaction.type === 'revenu' ? 'Revenu' : 'Dépense')}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className={`font-medium ${transaction.type === 'revenu' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'revenu' ? '+' : '-'}{Number(transaction.montant).toFixed(2)} €
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    {roommate ? `${roommate.prenom} ${roommate.nom}` : '-'}
                  </TableCell>
                )}
                <TableCell className="text-right">
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
                            onClick={() => onDeleteTransaction(transaction.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
