
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

type EmployeeSearchProps = {
  onSearch: (searchTerm: string) => void;
  onCenterChange: (centerId: string) => void;
  centers: Array<{ id: string; center_id: number; name: string }>;
  selectedCenter: string;
};

const EmployeeSearch = ({ onSearch, onCenterChange, centers, selectedCenter }: EmployeeSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedCenter} onValueChange={onCenterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select center" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-centers">All Centers</SelectItem>
              {centers.map((center) => (
                <SelectItem key={center.id} value={center.center_id.toString()}>
                  {center.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
};

export default EmployeeSearch;
