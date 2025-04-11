
import React from 'react';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onPropertyChange: (propertyId: string) => void;
  onAddTransaction: () => void;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedPropertyId,
  onPropertyChange,
  onAddTransaction
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <div className="w-full md:w-[250px]">
        <Select
          value={selectedPropertyId || ''}
          onValueChange={onPropertyChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une propriété" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedPropertyId && (
        <Button onClick={onAddTransaction}>
          <Plus className="mr-2 h-4 w-4" /> 
          {!isMobile && "Ajouter une transaction"}
          {isMobile && "Ajouter"}
        </Button>
      )}
    </div>
  );
};

export default PropertySelector;
