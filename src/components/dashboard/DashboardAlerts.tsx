
import { useMemo } from 'react';
import { Property, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { parseISO, isAfter, subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Roommate } from '@/types';

interface DashboardAlertsProps {
  properties: Property[];
  transactions: Transaction[];
  detailed?: boolean;
  onAddPayment: (propertyId: string, roommateId: string) => void;
}

export function DashboardAlerts({ 
  properties, 
  transactions,
  detailed = false,
  onAddPayment
}: DashboardAlertsProps) {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoommates = async () => {
      if (properties.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('colocataires_new')
          .select('*')
          .in('propriete_id', properties.map(p => p.id))
          .eq('statut', 'actif');

        if (error) throw error;
        setRoommates(data || []);
      } catch (error) {
        console.error('Error fetching roommates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoommates();
  }, [properties]);

  // Define a proper type for alerts that includes all possible properties
  type Alert = {
    type: string;
    title: string;
    description: string;
    property?: Property;
    roommate?: Roommate;
    severity: string;
  };

  const alerts = useMemo<Alert[]>(() => {
    if (roommates.length === 0) return [];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Find roommates that haven't paid this month
    const missingPayments = roommates.filter(roommate => {
      // Check if there's a rent payment for this month
      const hasRentPayment = transactions.some(t => 
        t.colocataire_id === roommate.id &&
        t.type === 'revenu' &&
        t.categorie === 'loyer' &&
        t.statut === 'complété' &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
      );
      
      return !hasRentPayment;
    });
    
    // Find late mortgage payments
    const lateMortgages = properties.filter(property => {
      if (!property.credit_mensuel || !property.jour_prelevement_credit) return false;
      
      // Check if the payment day has passed this month
      const paymentDayThisMonth = new Date(currentYear, currentMonth, property.jour_prelevement_credit);
      
      if (isAfter(today, paymentDayThisMonth)) {
        // Check if there's a mortgage payment for this month
        const hasMortgagePayment = transactions.some(t => 
          t.propriete_id === property.id &&
          t.type === 'depense' &&
          t.categorie === 'credit' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
        );
        
        return !hasMortgagePayment;
      }
      
      return false;
    });
    
    // Combine alerts
    return [
      ...missingPayments.map(roommate => {
        const property = properties.find(p => p.id === roommate.propriete_id);
        return {
          type: 'missing_payment',
          title: `Loyer impayé: ${roommate.prenom} ${roommate.nom}`,
          description: `Le loyer de ${formatCurrency(roommate.montant_loyer)} n'a pas été enregistré pour ${format(new Date(), 'MMMM yyyy', { locale: fr })}`,
          property: property,
          roommate: roommate,
          severity: 'high'
        };
      }),
      ...lateMortgages.map(property => {
        return {
          type: 'late_mortgage',
          title: `Crédit non enregistré: ${property.nom}`,
          description: `Le remboursement de crédit de ${formatCurrency(property.credit_mensuel!)} prévu le ${property.jour_prelevement_credit} n'a pas été enregistré`,
          property: property,
          severity: 'medium'
        };
      })
    ];
  }, [roommates, properties, transactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900">Tout est à jour</h3>
        <p className="text-sm text-gray-500">Aucune alerte à afficher</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-md ${
            alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{alert.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              
              {alert.type === 'missing_payment' && alert.property && alert.roommate && (
                <div className="mt-3">
                  <Button 
                    size="sm"
                    onClick={() => onAddPayment(alert.property!.id, alert.roommate!.id)}
                  >
                    Enregistrer le paiement
                  </Button>
                </div>
              )}
              
              {alert.type === 'late_mortgage' && alert.property && (
                <div className="mt-3">
                  <Button 
                    size="sm"
                    onClick={() => onAddPayment(alert.property!.id, '')}
                  >
                    Enregistrer le remboursement
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
