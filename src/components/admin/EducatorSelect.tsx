
import { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Educator {
  employee_id: number;
  name: string;
  center_id: number;
}

interface EducatorSelectProps {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
  centerId?: number;
  programId?: number;
  excludeEducatorId?: number;
  className?: string;
}

const EducatorSelect = ({
  value,
  onChange,
  label,
  required = false,
  centerId,
  programId,
  excludeEducatorId,
  className
}: EducatorSelectProps) => {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEducators = async () => {
      try {
        setLoading(true);
        
        // Query both educators table and employees with role 'educator'
        let query = supabase.from('educators').select('*');
        
        if (centerId) {
          query = query.eq('center_id', centerId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching educators:', error);
          return;
        }
        
        setEducators(data || []);
      } catch (err) {
        console.error('Error in fetchEducators:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEducators();
  }, [centerId, programId]);

  // Filter out the excluded educator (for secondary educator selection)
  const filteredEducators = educators.filter(
    educator => !excludeEducatorId || educator.employee_id !== excludeEducatorId
  );

  return (
    <div className={className}>
      <Label className="mb-2 block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select 
        value={value?.toString()} 
        onValueChange={(value) => onChange(parseInt(value))}
        disabled={loading || filteredEducators.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Loading educators..." : "Select an educator"} />
        </SelectTrigger>
        <SelectContent>
          {filteredEducators.map((educator) => (
            <SelectItem 
              key={educator.employee_id} 
              value={educator.employee_id.toString()}
            >
              {educator.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EducatorSelect;
