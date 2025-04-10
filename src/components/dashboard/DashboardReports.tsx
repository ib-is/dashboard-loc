
import { Property, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText, FilePdf, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface DashboardReportsProps {
  properties: Property[];
  transactions: Transaction[];
}

export function DashboardReports({ properties, transactions }: DashboardReportsProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>(properties[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Génération du rapport",
      description: "Le rapport sera disponible dans quelques instants.",
    });
    
    // In a real implementation, this would call an API to generate the report
    setTimeout(() => {
      toast({
        title: "Rapport généré",
        description: "Votre rapport est prêt à être téléchargé.",
      });
    }, 2000);
  };

  // Generate last 12 month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: fr })
    };
  });

  if (properties.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          Ajoutez une propriété pour générer des rapports
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une propriété" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.nom}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Rapports mensuels</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => handleGenerateReport('monthly-summary')}
          >
            <FilePdf className="mr-2 h-4 w-4" />
            Synthèse mensuelle
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => handleGenerateReport('balance-sheet')}
          >
            <FilePdf className="mr-2 h-4 w-4" />
            Bilan financier
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <Download className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Documents pour les locataires</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => handleGenerateReport('rent-receipts')}
          >
            <FilePdf className="mr-2 h-4 w-4" />
            Quittances de loyer
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => handleGenerateReport('payment-notice')}
          >
            <FilePdf className="mr-2 h-4 w-4" />
            Avis d'échéance
          </Button>
        </div>
      </div>
    </div>
  );
}
