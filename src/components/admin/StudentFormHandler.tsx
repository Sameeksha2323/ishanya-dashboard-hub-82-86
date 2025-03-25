
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
    handleSubmit: (data: any) => Promise<void>,
    lastStudentId?: number | null,
    centerId?: number,
    programId?: number
  ) => React.ReactNode);
  centerId?: number;
  programId?: number;
}

const StudentFormHandler = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  children,
  centerId,
  programId
}: StudentFormHandlerProps) => {
  const [lastStudentId, setLastStudentId] = useState<number | null>(null);
  
  useEffect(() => {
    // Fetch the last student ID when component mounts
    const fetchLastStudentId = async () => {
      try {
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
      } catch (err) {
        console.error('Error in fetchLastStudentId:', err);
      }
    };
    
    if (isOpen) {
      fetchLastStudentId();
    }
  }, [isOpen]);
  
  // Handle successful form submission
  const handleFormSubmitSuccess = () => {
    // Dispatch a custom event to notify any listeners that form submission was successful
    window.dispatchEvent(new CustomEvent('formSubmitSuccess'));
    
    // Close the form
    onClose();
    
    // Show a success message
    toast.success('Student record added successfully');
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
      toast.error('Failed to add student record');
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Student Record</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {typeof children === 'function'
            ? (children as (
                handleSubmit: (data: any) => Promise<void>, 
                lastStudentId?: number | null,
                centerId?: number,
                programId?: number
              ) => React.ReactNode)(handleSubmit, lastStudentId, centerId, programId)
            : children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentFormHandler;
