
import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyTransactionsStateProps {
  onAddTransaction: () => void;
}

const EmptyTransactionsState: React.FC<EmptyTransactionsStateProps> = ({
  onAddTransaction
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aucune transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Vous n'avez pas encore ajouté de transaction pour cette propriété.
        </p>
        <Button onClick={onAddTransaction}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une transaction
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyTransactionsState;
