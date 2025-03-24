
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CsvUpload from './CsvUpload';
import { toast } from 'sonner';

export type TableActionsProps = {
  tableName: string;
  onInsert: () => void;
  onRefresh: () => void;
  onUpload?: () => void;
  table?: any; // Added this prop to fix the type error
};

const TableActions = ({ tableName, onInsert, onRefresh, onUpload }: TableActionsProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
  };

  const handleUploadClick = () => {
    if (onUpload) {
      onUpload();
    } else {
      setIsUploadOpen(true);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-ishanya-green">
        {tableName.charAt(0).toUpperCase() + tableName.slice(1)} Data
      </h2>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          className="border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-ishanya-green hover:bg-ishanya-green/90"
          onClick={onInsert}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* CSV Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ishanya-green">Import CSV Data</DialogTitle>
          </DialogHeader>
          <CsvUpload 
            tableName={tableName} 
            onClose={handleCloseUpload} 
            onSuccess={onRefresh} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableActions;
