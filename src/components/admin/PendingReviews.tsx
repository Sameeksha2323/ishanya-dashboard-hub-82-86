import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DetailedFormView from './DetailedFormView';
import StudentFormHandler from './StudentFormHandler';
import StudentForm from './StudentForm';
import { supabase } from '@/integrations/supabase/client';

type FormEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  rowIndex: number;
  [key: string]: any;
};

const PendingReviews = () => {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [currentPointer, setCurrentPointer] = useState<number>(() => {
    return parseInt(localStorage.getItem('formEntryPointer') || '2', 10);
  });

  useEffect(() => {
    localStorage.setItem('formEntryPointer', currentPointer.toString());
  }, [currentPointer]);

  const fetchGoogleSheetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_KEY = 'AIzaSyACcbknWrMdZUapY8sQii16PclJ2xlPlqA';
      const SHEET_ID = '144Qh31BIIsDJYye5vWkE9WFhGI433yZU4TtKLq1wN4w';
      const RANGE = `Form Responses 1!A${currentPointer}:Z`;
      
      console.log(`Fetching data starting from row ${currentPointer}`);
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      if (!rows || rows.length === 0) {
        setEntries([]);
        toast.info('No form submissions to review');
        return;
      }
      
      const headerResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A1:Z1?key=${API_KEY}`
      );
      
      if (!headerResponse.ok) {
        throw new Error(`Failed to fetch headers: ${headerResponse.status} ${headerResponse.statusText}`);
      }
      
      const headerData = await headerResponse.json();
      const headers = headerData.values?.[0] || [];
      
      const formattedEntries = rows.map((row: any[], index: number) => {
        if (!row[0] && !row[1]) return null;
        
        const entry: FormEntry = {
          id: index.toString(),
          name: row[1] || 'N/A',
          email: row[14] || 'N/A',
          phone: row[12] || 'N/A',
          submittedAt: row[0] || 'N/A',
          rowIndex: currentPointer + index,
        };
        
        headers.forEach((header, i) => {
          if (i < row.length && i >= 0) {
            entry[header.toString()] = row[i];
          }
        });
        
        return entry;
      }).filter(Boolean);
      
      setEntries(formattedEntries);
      
      if (formattedEntries.length > 0) {
        toast.info(`${formattedEntries.length} form submissions pending review`);
      }
    } catch (err) {
      console.error('Error fetching Google Sheet data:', err);
      setError('Failed to fetch form submissions');
      toast.error('Error loading form submissions');
    } finally {
      setLoading(false);
    }
  }, [currentPointer]);

  useEffect(() => {
    fetchGoogleSheetData();
  }, [fetchGoogleSheetData]);

  const handleViewEntry = (entry: FormEntry) => {
    setSelectedEntry(entry);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: FormEntry) => {
    setSelectedEntry(entry);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleAcceptEntry = (entry: FormEntry) => {
    try {
      setIsDialogOpen(false);
      
      const studentFormData = {
        first_name: entry['First Name'] || '',
        last_name: entry['Last Name'] || '',
        gender: entry['Gender'] || '',
        dob: formatDateForDB(entry['Date of Birth']),
        primary_diagnosis: entry['Primary Diagnosis'] || '',
        comorbidity: entry['Comorbidity'] || '',
        udid: entry['UDID'] || '',
        fathers_name: entry["Father's Name"] || '',
        mothers_name: entry["Mother's Name"] || '',
        blood_group: entry['Blood Group'] || '',
        allergies: entry['Allergies'] || '',
        contact_number: entry['Contact Number'] || '',
        alt_contact_number: entry['Alternate Contact Number'] || '',
        parents_email: entry["Parent's Email"] || '',
        address: entry['Address'] || '',
        enrollment_year: new Date().getFullYear(),
        status: 'Active',
        student_email: entry["Parent's Email"] || '',
        center_id: extractNumberFromField(entry['Center']),
        program_id: extractNumberFromField(entry['Program']),
        student_id: entry['Student ID'] || `STU${Date.now().toString().slice(-6)}`,
      };
      
      setPrefillData({
        formData: studentFormData,
        sourceEntry: entry
      });
      
      setIsStudentFormOpen(true);
    } catch (err) {
      console.error('Error preparing form data:', err);
      toast.error('Failed to process form submission');
    }
  };

  const handleRejectEntry = async (entry: FormEntry) => {
    try {
      setIsDialogOpen(false);

      toast.loading('Rejecting form submission...');

      setCurrentPointer(prev => {
        const newPointer = entry.rowIndex + 1;
        console.log(`Moving pointer from ${prev} to ${newPointer}`);
        return newPointer;
      });
      
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      
      toast.dismiss();
      toast.success('Form submission has been rejected');
    } catch (err) {
      console.error('Error rejecting entry:', err);
      toast.dismiss();
      toast.error('Failed to reject form submission');
    }
  };

  const handleSubmitStudent = async (data: any) => {
    try {
      const { error } = await supabase
        .from('students')
        .insert([data]);
        
      if (error) {
        throw error;
      }
      
      if (prefillData?.sourceEntry) {
        setCurrentPointer(prev => {
          const newPointer = prefillData.sourceEntry.rowIndex + 1;
          return newPointer;
        });
        
        setEntries(prev => prev.filter(e => e.id !== prefillData.sourceEntry.id));
      }
      
      toast.success('Student added successfully');
      setIsStudentFormOpen(false);
      setPrefillData(null);
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast.error(error.message || 'Failed to add student');
      return Promise.reject(error);
    }
  };

  const updateGoogleSheetEntry = async (entry: FormEntry, updatedData: Record<string, any>) => {
    try {
      const API_KEY = 'AIzaSyACcbknWrMdZUapY8sQii16PclJ2xlPlqA';
      const SHEET_ID = '144Qh31BIIsDJYye5vWkE9WFhGI433yZU4TtKLq1wN4w';
      
      const headerResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A1:Z1?key=${API_KEY}`
      );
      
      if (!headerResponse.ok) {
        const errorText = await headerResponse.text();
        console.error(`Failed to fetch headers: ${headerResponse.status} - ${errorText}`);
        throw new Error(`Failed to fetch headers: ${headerResponse.status} ${headerResponse.statusText}`);
      }
      
      const headerData = await headerResponse.json();
      const headers = headerData.values?.[0] || [];
      
      const currentRowResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A${entry.rowIndex}:Z${entry.rowIndex}?key=${API_KEY}`
      );
      
      if (!currentRowResponse.ok) {
        const errorText = await currentRowResponse.text();
        console.error(`Failed to fetch current row: ${currentRowResponse.status} - ${errorText}`);
        throw new Error(`Failed to fetch current row: ${currentRowResponse.status}`);
      }
      
      const currentRowData = await currentRowResponse.json();
      const currentValues = currentRowData.values?.[0] || [];
      
      const rowData = headers.map((header: string, index: number) => {
        if (updatedData[header] !== undefined) {
          return updatedData[header];
        } else if (index < currentValues.length) {
          return currentValues[index];
        }
        return '';
      });
      
      console.log('Updating row with data:', rowData);
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A${entry.rowIndex}:Z${entry.rowIndex}?valueInputOption=RAW&key=${API_KEY}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: `Form Responses 1!A${entry.rowIndex}:Z${entry.rowIndex}`,
            majorDimension: 'ROWS',
            values: [rowData]
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Failed to update row: ${response.status} - ${errorData}`);
        throw new Error(`Failed to update row: ${response.status} ${response.statusText}`);
      }
      
      setEntries(prev => 
        prev.map(e => 
          e.id === entry.id 
            ? { ...e, ...updatedData } 
            : e
        )
      );
      
      toast.success('Entry updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating Google Sheet:', err);
      toast.error('Failed to update entry');
      throw err;
    }
  };

  const handleSaveEdit = async (updatedData: Record<string, any>) => {
    if (!selectedEntry) return;
    
    try {
      const updateResult = await updateGoogleSheetEntry(selectedEntry, updatedData);
      if (updateResult) {
        setIsDialogOpen(false);
        fetchGoogleSheetData();
      }
    } catch (err) {
      console.error('Error saving edits:', err);
    }
  };

  const handleResetPointer = () => {
    if (window.confirm('Are you sure you want to reset the form entry pointer? This will start processing entries from the beginning.')) {
      setCurrentPointer(2);
      toast.success('Form entry pointer has been reset');
    }
  };

  const formatDateForDB = (dateString: string | undefined): string | null => {
    if (!dateString) return null;
    
    try {
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      return null;
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  };

  const extractNumberFromField = (field: string | undefined): number | null => {
    if (!field) return null;
    
    try {
      const match = field.match(/ID:\s*(\d+)/i) || field.match(/\((\d+)\)/) || field.match(/(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
      return null;
    } catch (e) {
      console.error('Error extracting number from field:', e);
      return null;
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Pending Form Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-500" />
            Pending Form Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchGoogleSheetData}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-ishanya-yellow" />
              Pending Form Reviews
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchGoogleSheetData}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPointer}
                className="text-amber-600 hover:text-amber-700"
              >
                Reset Pointer
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Currently reading from row {currentPointer}
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No pending form submissions to review
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry['First Name'] || ''} {entry['Last Name'] || ''}
                      </TableCell>
                      <TableCell>{entry["Parent's Email"] || entry.email}</TableCell>
                      <TableCell>{entry['Contact Number'] || entry.phone}</TableCell>
                      <TableCell>{entry.submittedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewEntry(entry)}
                            title="View/Edit details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAcceptEntry(entry)}
                            className="text-green-600"
                            title="Accept"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectEntry(entry)}
                            className="text-red-600"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEntry && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'view' ? 'Form Submission Details' : 'Edit Form Submission'}
              </DialogTitle>
              <DialogDescription>
                Submitted on {selectedEntry.submittedAt}
              </DialogDescription>
            </DialogHeader>
            
            <DetailedFormView 
              entry={selectedEntry} 
              mode={dialogMode} 
              onSave={handleSaveEdit}
              onAccept={() => handleAcceptEntry(selectedEntry)}
              onReject={() => handleRejectEntry(selectedEntry)}
            />
            
            <DialogFooter className="flex justify-between sm:justify-between">
              {dialogMode === 'view' && (
                <div className="flex gap-2">
                  <Button onClick={() => handleEditEntry(selectedEntry)}>
                    Edit
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                {dialogMode === 'view' && (
                  <>
                    <Button 
                      onClick={() => handleAcceptEntry(selectedEntry)}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept & Add Student
                    </Button>
                    <Button 
                      onClick={() => handleRejectEntry(selectedEntry)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <StudentFormHandler
        isOpen={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setPrefillData(null);
        }}
        onSubmit={handleSubmitStudent}
        centerId={prefillData?.formData?.center_id}
        programId={prefillData?.formData?.program_id}
        title="Add Student from Form Submission"
      >
        {(handleSubmit) => (
          <StudentForm
            onSubmit={handleSubmit}
            lastStudentId={null}
            centerId={prefillData?.formData?.center_id}
            programId={prefillData?.formData?.program_id}
            initialValues={prefillData?.formData}
          />
        )}
      </StudentFormHandler>
    </>
  );
};

export default PendingReviews;
