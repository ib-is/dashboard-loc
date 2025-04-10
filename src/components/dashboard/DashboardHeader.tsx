
import { Property, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardHeaderProps {
  properties: Property[];
  user: User | null;
  selectedProperty: string;
  setSelectedProperty: (value: string) => void;
}

export function DashboardHeader({
  properties,
  user,
  selectedProperty,
  setSelectedProperty
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  
  const propertyLimit = user?.niveau_compte === 'free' ? 1 : 
                       user?.niveau_compte === 'plus' ? 3 : Infinity;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {properties.length > 0 && (
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
          {user?.niveau_compte !== 'free' && (
            <div className="flex gap-2">
              <Select
                value={selectedProperty}
                onValueChange={setSelectedProperty}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Toutes les propriétés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les propriétés</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {properties.length < propertyLimit && (
            <Button onClick={() => navigate('/properties/new')}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une propriété
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
