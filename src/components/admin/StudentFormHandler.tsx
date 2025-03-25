
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Update the type definition for the children prop
interface StudentFormHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode | ((
    handleSubmit: (data: any) => Promise<void>
  ) => React.ReactNode);
  centerId?: number;
  programId?: number;
  formType?: 'student' | 'employee';
  title?: string;
  initialValues?: any;
}

const StudentFormHandler = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  children,
  centerId,
  programId,
  formType = 'student',
  title,
  initialValues
}: StudentFormHandlerProps) => {
  const [lastStudentId, setLastStudentId] = useState<number | null>(null);
  const [lastEmployeeId, setLastEmployeeId] = useState<number | null>(null);
  
  useEffect(() => {
    // Fetch the last ID when component mounts
    const fetchLastIds = async () => {
      try {
        if (formType === 'student') {
          const { data, error } = await supabase
            .from('students')
            .select('student_id')
            .order('student_id', { ascending: false })
            .limit(1);
            
          if (error) {
            console.error('Error fetching last student ID:', error);
            return;
          }
          
          if (data && data.length > 0) {
            setLastStudentId(data[0].student_id);
          } else {
            setLastStudentId(1000); // Default starting ID if no students exist
          }
        } else if (formType === 'employee') {
          const { data, error } = await supabase
            .from('employees')
            .select('employee_id')
            .order('employee_id', { ascending: false })
            .limit(1);
            
          if (error) {
            console.error('Error fetching last employee ID:', error);
            return;
          }
          
          if (data && data.length > 0) {
            setLastEmployeeId(data[0].employee_id);
          } else {
            setLastEmployeeId(1000); // Default starting ID if no employees exist
          }
        }
      } catch (err) {
        console.error('Error in fetchLastIds:', err);
      }
    };
    
    if (isOpen) {
      fetchLastIds();
    }
  }, [isOpen, formType]);
  
  // Handle successful form submission
  const handleFormSubmitSuccess = () => {
    // Dispatch a custom event to notify any listeners that form submission was successful
    window.dispatchEvent(new CustomEvent('formSubmitSuccess'));
    
    // Close the form
    onClose();
    
    // Show a success message
    const entityType = formType === 'student' ? 'Student' : 'Employee';
    toast.success(`${entityType} record added successfully`);
  };
  
  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // If centerId and programId are provided, make sure they're set in the data
      if (centerId && !data.center_id) {
        data.center_id = centerId;
      }
      
      if (programId && !data.program_id) {
        data.program_id = programId;
      }
      
      // Remove created_at field if present
      if (data.created_at) {
        delete data.created_at;
      }
      
      // Submit the form data
      await onSubmit(data);
      
      // Trigger success handler
      handleFormSubmitSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      const entityType = formType === 'student' ? 'Student' : 'Employee';
      toast.error(`Failed to add ${entityType.toLowerCase()} record`);
    }
  };
  
  const getSheetTitle = () => {
    if (title) return title;
    return formType === 'student' ? 'Add Student Record' : 'Add Employee Record';
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getSheetTitle()}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {typeof children === 'function'
            ? (children as (handleSubmit: (data: any) => Promise<void>) => React.ReactNode)(handleSubmit)
            : children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentFormHandler;
