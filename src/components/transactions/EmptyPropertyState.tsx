
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EmptyPropertyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Aucune propriété trouvée</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Vous devez d'abord créer une propriété avant de pouvoir ajouter des transactions.
        </p>
        <Button onClick={() => navigate('/properties/new')}>
          Ajouter une propriété
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyPropertyState;
