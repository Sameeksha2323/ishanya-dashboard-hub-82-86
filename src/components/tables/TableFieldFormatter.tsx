
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isValid, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCenters, fetchProgramsByCenter } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

type TableFieldFormatterProps = {
  fieldName: string;
  value: any;
  onChange: (value: any) => void;
  isEditing: boolean;
  isRequired?: boolean;
};

// Helper function to capitalize first letter of each word
export const capitalizeFirstLetter = (str: string): string => {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const TableFieldFormatter = ({ fieldName, value, onChange, isEditing, isRequired = false }: TableFieldFormatterProps) => {
  const [centers, setCenters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Safe toString conversion that handles undefined/null values
  const safeToString = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val);
  };

  useEffect(() => {
    // Fetch centers for center_id field
    if (fieldName === 'center_id' && isEditing) {
      const loadCenters = async () => {
        try {
          const { data, error } = await supabase
            .from('centers')
            .select('center_id, name')
            .order('name');
            
          if (!error && data) {
            setCenters(data);
          }
        } catch (err) {
          console.error('Error loading centers:', err);
        }
      };
      
      loadCenters();
    }
    
    // Fetch programs for program_id field
    if ((fieldName === 'program_id' || fieldName === 'program_2_id') && isEditing) {
      const loadPrograms = async () => {
        try {
          const { data, error } = await supabase
            .from('programs')
            .select('program_id, name')
            .order('name');
            
          if (!error && data) {
            setPrograms(data);
          }
        } catch (err) {
          console.error('Error loading programs:', err);
        }
      };
      
      loadPrograms();
    }
    
    // Fetch employees/educators for educator fields
    if ((fieldName === 'educator_employee_id' || fieldName === 'secondary_educator_employee_id') && isEditing) {
      const loadEmployees = async () => {
        try {
          const { data, error } = await supabase
            .from('educators')
            .select('employee_id, name')
            .order('name');
            
          if (!error && data) {
            setEmployees(data);
          }
        } catch (err) {
          console.error('Error loading educators:', err);
        }
      };
      
      loadEmployees();
    }
  }, [fieldName, isEditing]);

  // Special handling for password field
  if (fieldName === 'password') {
    if (isEditing) {
      return (
        <Input
          type="password"
          value={safeToString(value)}
          onChange={(e) => onChange(e.target.value)}
          className={isRequired ? "border-red-500" : ""}
        />
      );
    }
    return <div>••••••••</div>;
  }

  // Handle date fields
  if (fieldName.includes('date') || fieldName === 'dob' || fieldName === 'created_at') {
    if (isEditing) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                isRequired && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(new Date(value), 'PPP') : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }
    
    if (!value) return <div>-</div>;
    
    try {
      const date = new Date(value);
      return <div>{isValid(date) ? format(date, 'MMM d, yyyy') : safeToString(value)}</div>;
    } catch (e) {
      return <div>{safeToString(value)}</div>;
    }
  }

  // Handle center_id field
  if (fieldName === 'center_id') {
    if (isEditing) {
      return (
        <Select
          value={value ? safeToString(value) : ''}
          onValueChange={(val) => onChange(val ? parseInt(val, 10) : null)}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select center" />
          </SelectTrigger>
          <SelectContent>
            {centers.map((center) => (
              <SelectItem key={center.center_id} value={safeToString(center.center_id)}>
                {center.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (!value) return <div>-</div>;
    
    // Try to find the center name
    const center = centers.find(c => c.center_id === value);
    return <div>{center ? center.name : safeToString(value)}</div>;
  }

  // Handle program_id fields
  if (fieldName === 'program_id' || fieldName === 'program_2_id') {
    if (isEditing) {
      return (
        <Select
          value={value ? safeToString(value) : ''}
          onValueChange={(val) => onChange(val ? parseInt(val, 10) : null)}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent>
            {/* Changed from empty string to "none" with a value */}
            <SelectItem value="0">None</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.program_id} value={safeToString(program.program_id)}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (!value) return <div>-</div>;
    
    // Try to find the program name
    const program = programs.find(p => p.program_id === value);
    return <div>{program ? program.name : safeToString(value)}</div>;
  }

  // Handle educator fields
  if (fieldName === 'educator_employee_id' || fieldName === 'secondary_educator_employee_id') {
    if (isEditing) {
      return (
        <Select
          value={value ? safeToString(value) : ''}
          onValueChange={(val) => onChange(val ? parseInt(val, 10) : null)}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select educator" />
          </SelectTrigger>
          <SelectContent>
            {fieldName === 'secondary_educator_employee_id' && (
              // Changed from empty string to "0" with a value
              <SelectItem value="0">None</SelectItem>
            )}
            {employees.map((employee) => (
              <SelectItem key={employee.employee_id} value={safeToString(employee.employee_id)}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (!value) return <div>-</div>;
    
    // Try to find the employee name
    const employee = employees.find(e => e.employee_id === value);
    return <div>{employee ? employee.name : safeToString(value)}</div>;
  }

  // Handle boolean fields
  if (typeof value === 'boolean' || fieldName.includes('is_')) {
    if (isEditing) {
      return (
        <Select
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onValueChange={(val) => {
            if (val === 'true') onChange(true);
            else if (val === 'false') onChange(false);
            else onChange(null);
          }}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
            {!isRequired && (
              // Changed from empty string to "null" with a value
              <SelectItem value="null">Not specified</SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
    
    if (value === null || value === undefined) return <div>-</div>;
    return <div>{value ? 'Yes' : 'No'}</div>;
  }

  // Handle gender field
  if (fieldName === 'gender') {
    if (isEditing) {
      return (
        <Select
          value={safeToString(value)}
          onValueChange={onChange}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
            {!isRequired && (
              // Changed from empty string to "unspecified" with a value
              <SelectItem value="unspecified">Not specified</SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
    
    return <div>{value || '-'}</div>;
  }

  // Handle status field
  if (fieldName === 'status') {
    if (isEditing) {
      return (
        <Select
          value={safeToString(value)}
          onValueChange={onChange}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="On Leave">On Leave</SelectItem>
            <SelectItem value="Graduated">Graduated</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Alumni">Alumni</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    return <div>{value || '-'}</div>;
  }

  // Handle blood_group field
  if (fieldName === 'blood_group') {
    if (isEditing) {
      return (
        <Select
          value={safeToString(value)}
          onValueChange={onChange}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
            {!isRequired && (
              // Changed from empty string to "unknown" with a value
              <SelectItem value="unknown">Not specified</SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
    
    return <div>{value || '-'}</div>;
  }

  // Handle employment_type field
  if (fieldName === 'employment_type') {
    if (isEditing) {
      return (
        <Select
          value={safeToString(value)}
          onValueChange={onChange}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Temporary">Temporary</SelectItem>
            <SelectItem value="Intern">Intern</SelectItem>
            {!isRequired && (
              // Changed from empty string to "unspecified" with a value
              <SelectItem value="unspecified">Not specified</SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
    
    return <div>{value || '-'}</div>;
  }

  // Handle department field
  if (fieldName === 'department') {
    if (isEditing) {
      return (
        <Select
          value={safeToString(value)}
          onValueChange={onChange}
        >
          <SelectTrigger className={isRequired ? "border-red-500" : ""}>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Administration">Administration</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Support Staff">Support Staff</SelectItem>
            {!isRequired && (
              // Changed from empty string to "unspecified" with a value  
              <SelectItem value="unspecified">Not specified</SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
    
    return <div>{value || '-'}</div>;
  }

  // Handle array fields (like days_of_week)
  if (fieldName === 'days_of_week' || Array.isArray(value)) {
    if (isEditing) {
      // Provide a text input for comma-separated values
      return (
        <Input
          value={Array.isArray(value) ? value.join(', ') : safeToString(value)}
          onChange={(e) => {
            const inputValue = e.target.value;
            // Handle empty input
            if (!inputValue.trim()) {
              onChange(null);
              return;
            }
            
            // Parse comma-separated string to array
            const arrayValue = inputValue.split(',').map(item => item.trim());
            onChange(arrayValue);
          }}
          placeholder="Enter comma-separated values (e.g., Monday, Wednesday, Friday)"
          className={isRequired ? "border-red-500" : ""}
        />
      );
    }
    
    if (!value) return <div>-</div>;
    
    // Safely display array values
    if (Array.isArray(value)) {
      return <div>{value.map(v => safeToString(v)).join(', ')}</div>;
    }
    
    // Handle string representation of array
    return <div>{safeToString(value)}</div>;
  }

  // Default field handling
  if (isEditing) {
    // Use textarea for potentially longer text fields
    if (
      fieldName.includes('description') ||
      fieldName.includes('comment') ||
      fieldName.includes('notes') ||
      fieldName.includes('address') ||
      fieldName.includes('strengths') ||
      fieldName.includes('weakness') ||
      fieldName === 'allergies'
    ) {
      return (
        <Textarea
          value={safeToString(value)}
          onChange={(e) => onChange(e.target.value)}
          className={isRequired ? "border-red-500" : ""}
          rows={3}
        />
      );
    }
    
    // Use regular input for other fields
    return (
      <Input
        value={safeToString(value)}
        onChange={(e) => onChange(e.target.value)}
        className={isRequired ? "border-red-500" : ""}
        type={
          fieldName.includes('phone') || fieldName.includes('number') || 
          fieldName.includes('contact') || 
          fieldName.includes('_id') || fieldName.includes('year')
            ? 'tel'
            : fieldName.includes('email')
              ? 'email'
              : 'text'
        }
      />
    );
  }
  
  // For read-only display
  if (value === null || value === undefined) return <div>-</div>;
  
  // Handle potentially long text for display
  if (
    fieldName.includes('description') ||
    fieldName.includes('comment') ||
    fieldName.includes('notes') ||
    fieldName.includes('address') ||
    fieldName.includes('strengths') ||
    fieldName.includes('weakness') ||
    fieldName === 'allergies'
  ) {
    return (
      <div className="max-h-24 overflow-y-auto whitespace-pre-wrap">
        {safeToString(value)}
      </div>
    );
  }
  
  return <div>{safeToString(value)}</div>;
};
