import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCw, FileText, Mic } from 'lucide-react';
import StudentFormHandler from '@/components/admin/StudentFormHandler';
import StudentForm from '@/components/admin/StudentForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
            onClick={() => setShowStudentForm(true)}
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
    </Card>
  );
};

export default TableActions;
