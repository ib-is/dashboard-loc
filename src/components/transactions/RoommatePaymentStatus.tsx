
import React from 'react';
import { Roommate } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

interface RoommatePaymentStatusProps {
  roommates: Roommate[];
  paymentStatus: Record<string, { paid: boolean, amount: number }>;
  onAddPayment: (colocataireId: string) => void;
}

const RoommatePaymentStatus: React.FC<RoommatePaymentStatusProps> = ({
  roommates,
  paymentStatus,
  onAddPayment
}) => {
  if (roommates.length === 0) return null;
  
  const totalExpected = roommates.reduce((sum, roommate) => sum + roommate.montant_loyer, 0);
  const totalPaid = roommates.reduce((sum, roommate) => {
    const status = paymentStatus[roommate.id];
    return sum + (status?.paid ? status.amount : 0);
  }, 0);
  
  const paidCount = roommates.filter(r => paymentStatus[r.id]?.paid).length;
  const paidPercentage = roommates.length > 0 ? (paidCount / roommates.length) * 100 : 0;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h3 className="font-semibold">État des paiements de loyer</h3>
            <p className="text-sm text-muted-foreground">
              {paidCount} sur {roommates.length} colocataires ont payé ({paidPercentage.toFixed(0)}%)
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="text-sm flex items-center gap-1">
              <span>Total attendu:</span>
              <span className="font-semibold">{totalExpected.toFixed(2)} €</span>
            </div>
            <div className="text-sm flex items-center gap-1">
              <span>Total reçu:</span>
              <span className={`font-semibold ${totalPaid >= totalExpected ? 'text-green-600' : 'text-amber-600'}`}>
                {totalPaid.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roommates.map(roommate => {
            const status = paymentStatus[roommate.id];
            const isPaid = status?.paid;
            
            return (
              <div 
                key={roommate.id} 
                className={`flex items-center justify-between p-3 rounded-md border ${
                  isPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <div className="font-medium">{roommate.prenom} {roommate.nom}</div>
                    <div className="text-sm">{roommate.montant_loyer.toFixed(2)} €</div>
                  </div>
                </div>
                
                {!isPaid && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAddPayment(roommate.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Enregistrer
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoommatePaymentStatus;
