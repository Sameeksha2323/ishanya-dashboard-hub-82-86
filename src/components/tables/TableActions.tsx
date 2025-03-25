
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCw, FileText, Mic } from 'lucide-react';
import StudentFormHandler from '@/components/admin/StudentFormHandler';
import StudentForm from '@/components/admin/StudentForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import VoiceInputDialog from '@/components/ui/VoiceInputDialog';
import { openVoiceInputDialog } from '@/utils/formEventUtils';

type TableActionsProps = {
  tableName: string;
  onInsert?: () => void;
  onUpload?: () => void;
  onRefresh?: () => void;
  table?: any;
};

const TableActions = ({ 
  tableName, 
  onInsert, 
  onUpload, 
  onRefresh,
  table
}: TableActionsProps) => {
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  const handleAddStudent = async (data: any) => {
    try {
      const { error } = await supabase
        .from('students')
        .insert([data]);
        
      if (error) {
        throw error;
      }
      
      toast.success('Student added successfully');
      if (onRefresh) onRefresh();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast.error(error.message || 'Failed to add student');
      return Promise.reject(error);
    }
  };
  
  const handleAddClick = () => {
    if (tableName.toLowerCase() === 'students') {
      setShowStudentForm(true);
    } else if (onInsert) {
      onInsert();
    }
  };
  
  const handleVoiceEntry = () => {
    setShowVoiceInput(true);
  };
  
  const handleVoiceInputComplete = async (data: any) => {
    try {
      // Get the proper table name (lowercase)
      const tableNameLower = tableName.toLowerCase();
      
      // Check if the table exists in our schema
      if (!['students', 'educators', 'employees', 'centers', 'programs'].includes(tableNameLower)) {
        throw new Error(`Table ${tableNameLower} is not supported for voice input`);
      }
      
      // Handle the data from voice input
      const { error } = await supabase
        .from(tableNameLower as any)
        .insert([data]);
        
      if (error) {
        throw error;
      }
      
      toast.success(`${tableName} added successfully via voice input`);
      if (onRefresh) onRefresh();
      setShowVoiceInput(false);
    } catch (error: any) {
      console.error(`Error adding ${tableName}:`, error);
      toast.error(error.message || `Failed to add ${tableName}`);
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default"
            onClick={handleAddClick}
            className="flex items-center"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Record
          </Button>
          
          {onUpload && (
            <Button 
              variant="outline"
              onClick={onUpload}
              className="flex items-center"
            >
              <Upload className="mr-1 h-4 w-4" />
              Upload CSV
            </Button>
          )}
          
          {onRefresh && (
            <Button 
              variant="outline"
              onClick={onRefresh}
              className="flex items-center"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={handleVoiceEntry}
            className="flex items-center"
          >
            <Mic className="mr-1 h-4 w-4" />
            Voice Entry
          </Button>
        </div>
      </CardContent>
      
      {tableName.toLowerCase() === 'students' && (
        <StudentFormHandler
          isOpen={showStudentForm}
          onClose={() => setShowStudentForm(false)}
          onSubmit={handleAddStudent}
          centerId={table?.center_id}
          programId={table?.program_id}
        >
          {(handleSubmit) => (
            <StudentForm
              onSubmit={handleSubmit}
              lastStudentId={null}
              centerId={table?.center_id}
              programId={table?.program_id}
            />
          )}
        </StudentFormHandler>
      )}
      
      {showVoiceInput && (
        <VoiceInputDialog
          isOpen={showVoiceInput}
          onClose={() => setShowVoiceInput(false)}
          table={tableName.toLowerCase()}
          onComplete={handleVoiceInputComplete}
        />
      )}
    </Card>
  );
};

export default TableActions;
