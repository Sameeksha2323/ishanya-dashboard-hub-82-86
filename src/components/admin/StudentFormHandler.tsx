
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface StudentFormHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode;
}

const StudentFormHandler = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  children 
}: StudentFormHandlerProps) => {
  
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
          {/* The error is here - fix how we handle children */}
          {typeof children === 'function' 
            ? children(handleSubmit)
            : children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentFormHandler;
