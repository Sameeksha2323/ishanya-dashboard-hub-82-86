
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ChevronRight, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { fetchSheetData, deleteSheetRow, formatStudentDataFromSheet } from '@/utils/googleSheetsUtils';
import StudentFormHandler from './StudentFormHandler';
import StudentForm from './StudentForm';
import { supabase } from '@/integrations/supabase/client';

const PendingReviews = () => {
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rejectRowIndex, setRejectRowIndex] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [lastStudentId, setLastStudentId] = useState<number | null>(1001);
  const [formattedStudentData, setFormattedStudentData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData();
        
        if (data && Array.isArray(data)) {
          setSheetData(data);
        } else {
          setError('Invalid data format received from the API');
        }
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        setError('Failed to load pending reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
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
          setLastStudentId(1000); // Default starting ID
        }
      } catch (err) {
        console.error('Error fetching last student ID:', err);
      }
    };
    
    fetchData();
    fetchLastStudentId();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleViewDetails = (entry: any) => {
    setSelectedEntry(entry);
    setShowDetailDialog(true);
  };
  
  const handleAccept = (entry: any) => {
    // Format the sheet data to match the student data structure
    const formattedData = formatStudentDataFromSheet(entry);
    setFormattedStudentData(formattedData);
    setSelectedEntry(entry);
    
    // Open the student form with pre-filled data
    setShowStudentForm(true);
  };
  
  const handleReject = (entry: any, rowIndex: number) => {
    setSelectedEntry(entry);
    setRejectRowIndex(rowIndex);
    setShowConfirmDialog(true);
  };
  
  const confirmReject = async () => {
    if (rejectRowIndex === null) return;
    
    setProcessingAction(true);
    try {
      // Row indexes are 0-based in the API but 1-based in the sheet
      await deleteSheetRow(rejectRowIndex + 1);
      
      // Update the UI by removing the rejected entry
      setSheetData(sheetData.filter((_, index) => index !== rejectRowIndex));
      
      toast({
        description: "Entry rejected and removed from the pending list.",
      });
    } catch (err) {
      console.error('Error rejecting entry:', err);
      toast({
        description: "Failed to reject entry. Please try again.",
      });
    } finally {
      setProcessingAction(false);
      setShowConfirmDialog(false);
      setRejectRowIndex(null);
    }
  };
  
  const handleStudentSubmit = async (data: any) => {
    setProcessingAction(true);
    try {
      // Submit to database
      const { error } = await supabase
        .from('students')
        .insert([data]);
        
      if (error) {
        throw error;
      }
      
      // If successful, delete from sheet
      if (selectedEntry && typeof selectedEntry.rowIndex === 'number') {
        await deleteSheetRow(selectedEntry.rowIndex);
      }
      
      // Update the UI
      setSheetData(sheetData.filter(entry => entry !== selectedEntry));
      
      toast({
        description: "Student added successfully and removed from pending list.",
      });
      
      setShowStudentForm(false);
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error adding student:', err);
      toast({
        description: err.message || "Failed to add student",
      });
      return Promise.reject(err);
    } finally {
      setProcessingAction(false);
    }
  };
  
  if (loading && sheetData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Students waiting for review</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading pending reviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Students waiting for review</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Students waiting for review</CardDescription>
        </CardHeader>
        <CardContent>
          {sheetData.length === 0 ? (
            <div className="min-h-[150px] flex items-center justify-center">
              <p className="text-gray-500">No pending reviews at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sheetData.slice(0, 5).map((entry, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h3 className="font-medium">
                      {entry.firstName} {entry.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {entry.email || 'No email'} • {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(entry)}
                    >
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                      onClick={() => handleAccept(entry)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" /> Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                      onClick={() => handleReject(entry, index)}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
              
              {sheetData.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button variant="link">View All ({sheetData.length})</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Application Details</DialogTitle>
            <DialogDescription>
              Review the application information below
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto py-4">
              {Object.entries(selectedEntry).map(([key, value]) => 
                key !== 'rowIndex' && (
                  <div key={key} className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm">{String(value || '-')}</p>
                  </div>
                )
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDetailDialog(false);
                  if (selectedEntry) {
                    handleReject(selectedEntry, selectedEntry.rowIndex || 0);
                  }
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailDialog(false)}
              >
                Close
              </Button>
              <Button 
                variant="default"
                className="bg-ishanya-green hover:bg-ishanya-green/90"
                onClick={() => {
                  setShowDetailDialog(false);
                  if (selectedEntry) {
                    handleAccept(selectedEntry);
                  }
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Accept
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Reject Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this entry from the pending reviews. 
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmReject();
              }}
              disabled={processingAction}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Student Form */}
      <StudentFormHandler
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        onSubmit={handleStudentSubmit}
        title="Add Student from Application"
        sourceEntry={selectedEntry}
      >
        {(handleSubmit) => (
          <StudentForm
            onSubmit={handleSubmit}
            lastStudentId={lastStudentId}
            initialData={formattedStudentData}
          />
        )}
      </StudentFormHandler>
    </>
  );
};

export default PendingReviews;
