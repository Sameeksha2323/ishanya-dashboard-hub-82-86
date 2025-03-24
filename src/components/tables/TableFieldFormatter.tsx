
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type TableFieldFormatterProps = {
  fieldName: string;
  value: any;
  onChange: (value: any) => void;
  isEditing: boolean;
  isRequired?: boolean;
};

const capitalizeFirstLetter = (string: string) => {
  if (!string) return '';
  
  // Handle special cases
  if (string.toLowerCase() === 'dob') return 'DOB';
  if (string.toLowerCase() === 'id') return 'ID';
  if (string.toLowerCase() === 'udid') return 'UDID';
  if (string.toLowerCase() === 'lor') return 'LOR';
  
  // Handle snake_case field names
  return string
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const TableFieldFormatter: React.FC<TableFieldFormatterProps> = ({ 
  fieldName, 
  value, 
  onChange, 
  isEditing,
  isRequired = false
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [relatedName, setRelatedName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  useEffect(() => {
    // Load options for dropdown fields when in edit mode
    if (isEditing) {
      const fetchOptions = async () => {
        // Fetch options based on field name
        if (fieldName === 'center_id') {
          const { data } = await supabase.from('centers').select('center_id, name');
          if (data) setOptions(data);
        } 
        else if (fieldName === 'program_id' || fieldName === 'program_2_id') {
          const { data } = await supabase.from('programs').select('program_id, name');
          if (data) setOptions(data);
        }
        else if (fieldName === 'educator_employee_id' || fieldName === 'secondary_educator_employee_id') {
          const { data } = await supabase.from('educators').select('employee_id, name');
          if (data) setOptions(data);
        }
        
        // If the value is set, fetch the related name for display
        if (value) {
          if (fieldName === 'center_id') {
            const { data } = await supabase.from('centers').select('name').eq('center_id', value).single();
            if (data) setRelatedName(data.name);
          }
          else if (fieldName === 'program_id' || fieldName === 'program_2_id') {
            const { data } = await supabase.from('programs').select('name').eq('program_id', value).single();
            if (data) setRelatedName(data.name);
          }
          else if (fieldName === 'educator_employee_id' || fieldName === 'secondary_educator_employee_id') {
            const { data } = await supabase.from('educators').select('name').eq('employee_id', value).single();
            if (data) setRelatedName(data.name);
          }
        }
      };

      fetchOptions();
    }
  }, [fieldName, isEditing, value]);

  // Handle date fields
  if ((fieldName === 'dob' || fieldName.includes('date') || fieldName.includes('joining') || fieldName.includes('leaving')) && isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  onChange(date ? format(date, 'yyyy-MM-dd') : null);
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle dropdown fields for IDs
  if ((fieldName === 'center_id' || fieldName === 'program_id' || fieldName === 'program_2_id' || 
       fieldName === 'educator_employee_id' || fieldName === 'secondary_educator_employee_id') && isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select 
            value={value ? value.toString() : ''} 
            onValueChange={(val) => onChange(val ? parseInt(val) : null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${capitalizeFirstLetter(fieldName)}`}>
                {value ? `${value}${relatedName ? ` - ${relatedName}` : ''}` : ''}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option[fieldName.replace('_id', '_id')] || option.employee_id} 
                  value={(option[fieldName.replace('_id', '_id')] || option.employee_id).toString()}
                >
                  {`${option[fieldName.replace('_id', '_id')] || option.employee_id} - ${option.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle blood group dropdown
  if (fieldName === 'blood_group' && isEditing) {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Blood Group" />
            </SelectTrigger>
            <SelectContent>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle gender dropdown
  if (fieldName === 'gender' && isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle status dropdown
  if (fieldName === 'status' && isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle session type dropdown
  if (fieldName === 'session_type' && isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Session Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle transport dropdown
  if (fieldName === 'transport' && isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Transport Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle enrollment year dropdown
  if (fieldName === 'enrollment_year' && isEditing) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i);
    
    return (
      <div>
        <div className="flex items-center gap-2">
          <Select 
            value={value ? value.toString() : ''} 
            onValueChange={(val) => onChange(val ? parseInt(val) : null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isRequired && isEditing && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  }

  // Handle password field separately (hide in view mode)
  if (fieldName === 'password') {
    if (!isEditing) {
      return <div>••••••••</div>;
    } else {
      return (
        <div>
          <div className="flex items-center gap-2">
            <Input 
              type="password"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              showPasswordToggle
            />
            {isRequired && <span className="text-red-500">*</span>}
          </div>
        </div>
      );
    }
  }

  // For created_at field - should be read-only
  if (fieldName === 'created_at') {
    return <div>{value ? new Date(value).toLocaleString() : ''}</div>;
  }

  // Default - regular input field or display value
  if (isEditing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Input 
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {isRequired && <span className="text-red-500">*</span>}
        </div>
      </div>
    );
  } else {
    return <div>{value}</div>;
  }
};

export { TableFieldFormatter, capitalizeFirstLetter };
