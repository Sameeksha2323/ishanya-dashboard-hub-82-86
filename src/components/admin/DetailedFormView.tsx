
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DetailedFormViewProps {
  entry: Record<string, any>;
  mode: 'view' | 'edit';
  onSave?: (updatedData: Record<string, any>) => void;
  onAccept?: (entry: Record<string, any>) => void;
  onReject?: (entry: Record<string, any>) => void;
}

const DetailedFormView = ({
  entry,
  mode,
  onSave,
  onAccept,
  onReject
}: DetailedFormViewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data with entry values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    
    // Filter out special fields and metadata
    Object.entries(entry).forEach(([key, value]) => {
      if (!['id', 'rowIndex'].includes(key)) {
        initialData[key] = value;
      }
    });
    
    setFormData(initialData);
  }, [entry]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!onSave) return;
    
    try {
      setIsLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    
    try {
      setIsLoading(true);
      await onAccept(entry);
    } catch (error) {
      console.error('Error accepting entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    
    try {
      setIsLoading(true);
      await onReject(entry);
    } catch (error) {
      console.error('Error rejecting entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which fields to display and in what order
  const getFormFields = () => {
    // Define important fields to show at the top
    const priorityFields = [
      'First Name',
      'Last Name',
      'Gender',
      'Date of Birth',
      'Primary Diagnosis',
      'Comorbidity',
      'UDID',
      'Father\'s Name',
      'Mother\'s Name',
      'Blood Group',
      'Allergies',
      'Contact Number',
      'Alternate Contact Number',
      'Parent\'s Email',
      'Address',
    ];
    
    // Get all keys from formData
    const allFields = Object.keys(formData);
    
    // Filter out system fields and Timestamp
    const filteredFields = allFields.filter(
      field => !['id', 'rowIndex', 'Timestamp', 'submittedAt'].includes(field)
    );
    
    // Sort fields with priority fields first, then alphabetically
    return filteredFields.sort((a, b) => {
      const aIndex = priorityFields.indexOf(a);
      const bIndex = priorityFields.indexOf(b);
      
      // If both are priority fields, sort by priority order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only a is a priority field, it comes first
      if (aIndex !== -1) return -1;
      
      // If only b is a priority field, it comes first
      if (bIndex !== -1) return 1;
      
      // If neither are priority fields, sort alphabetically
      return a.localeCompare(b);
    });
  };

  // Format field label for display
  const formatFieldLabel = (field: string) => {
    // If field is already well-formatted, return as is
    if (/^[A-Z]/.test(field) || field.includes("'")) {
      return field;
    }
    
    // Otherwise, convert from camelCase or snake_case
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Determine if a field should use textarea instead of input
  const shouldUseTextarea = (field: string, value: string) => {
    return field.toLowerCase().includes('address') || 
           (typeof value === 'string' && value.length > 50);
  };

  return (
    <div>
      {mode === 'view' && onAccept && onReject && (
        <div className="flex justify-end mb-4 gap-2">
          <Button 
            onClick={handleAccept}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            Accept & Add Student
          </Button>
          <Button 
            onClick={handleReject}
            variant="destructive"
            disabled={isLoading}
          >
            Reject
          </Button>
        </div>
      )}
    
      <ScrollArea className="h-[60vh] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
          {getFormFields().map(field => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="font-medium">
                {formatFieldLabel(field)}
              </Label>
              
              {mode === 'view' ? (
                <div className="p-2 bg-gray-50 rounded border min-h-[38px]">
                  {formData[field] || '-'}
                </div>
              ) : shouldUseTextarea(field, formData[field] || '') ? (
                <Textarea
                  id={field}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-full"
                />
              ) : (
                <Input
                  id={field}
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        
        {mode === 'edit' && (
          <div className="flex justify-end mt-6 gap-2">
            <Button 
              onClick={handleSaveChanges} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DetailedFormView;
