
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, Filter, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TransactionFiltersProps {
  typeFilter: string[];
  dateRangeStart: string;
  dateRangeEnd: string;
  searchTerm: string;
  isSearchOpen: boolean;
  isMobile: boolean;
  onTypeFilterChange: (type: string) => void;
  onDateRangeStartChange: (date: string) => void;
  onDateRangeEndChange: (date: string) => void;
  onSearchTermChange: (term: string) => void;
  onSearchToggle: (isOpen: boolean) => void;
  onResetFilters: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  typeFilter,
  dateRangeStart,
  dateRangeEnd,
  searchTerm,
  isSearchOpen,
  isMobile,
  onTypeFilterChange,
  onDateRangeStartChange,
  onDateRangeEndChange,
  onSearchTermChange,
  onSearchToggle,
  onResetFilters
}) => {
  return (
    <>
      {isMobile ? (
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="flex-1">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="flex-1 flex justify-between items-center"
              onClick={() => onSearchToggle(true)}
            >
              <span>Rechercher</span>
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrer par type</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="revenu-mobile"
                    checked={typeFilter.includes('revenu')}
                    onCheckedChange={() => onTypeFilterChange('revenu')}
                  />
                  <Label htmlFor="revenu-mobile" className="flex items-center gap-1">
                    <ArrowUp className="h-4 w-4 text-green-500" /> Revenus
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="depense-mobile"
                    checked={typeFilter.includes('depense')}
                    onCheckedChange={() => onTypeFilterChange('depense')}
                  />
                  <Label htmlFor="depense-mobile" className="flex items-center gap-1">
                    <ArrowDown className="h-4 w-4 text-red-500" /> Dépenses
                  </Label>
                </div>
                
                <h4 className="font-medium">Plage de dates</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-start-mobile">Début</Label>
                    <Input
                      id="date-start-mobile"
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => onDateRangeStartChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-end-mobile">Fin</Label>
                    <Input
                      id="date-end-mobile"
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => onDateRangeEndChange(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={onResetFilters} className="w-full">
                  Réinitialiser les filtres
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {isSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onSearchToggle(false)}
            >
              <ArrowDown className="h-4 w-4 rotate-45" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="max-w-[200px]"
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrer par type</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="revenu"
                    checked={typeFilter.includes('revenu')}
                    onCheckedChange={() => onTypeFilterChange('revenu')}
                  />
                  <Label htmlFor="revenu" className="flex items-center gap-1">
                    <ArrowUp className="h-4 w-4 text-green-500" /> Revenus
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="depense"
                    checked={typeFilter.includes('depense')}
                    onCheckedChange={() => onTypeFilterChange('depense')}
                  />
                  <Label htmlFor="depense" className="flex items-center gap-1">
                    <ArrowDown className="h-4 w-4 text-red-500" /> Dépenses
                  </Label>
                </div>
                
                <h4 className="font-medium">Plage de dates</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-start">Début</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => onDateRangeStartChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-end">Fin</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => onDateRangeEndChange(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={onResetFilters} className="w-full">
                  Réinitialiser les filtres
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  );
};

export default TransactionFilters;
