
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Eye, Check, X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DetailedFormView from './DetailedFormView';
import { insertRow } from '@/lib/api';

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

  useEffect(() => {
    fetchGoogleSheetData();
  }, []);

  const fetchGoogleSheetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_KEY = 'AIzaSyACcbknWrMdZUapY8sQii16PclJ2xlPlqA';
      const SHEET_ID = '144Qh31BIIsDJYye5vWkE9WFhGI433yZU4TtKLq1wN4w';
      const RANGE = 'Form Responses 1!A2:Z'; // Assuming headers are in the first row
      
      // Use the Google Sheets API REST endpoint directly
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
      
      // Get headers from the first row using a separate API call
      const headerResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A1:Z1?key=${API_KEY}`
      );
      
      if (!headerResponse.ok) {
        throw new Error(`Failed to fetch headers: ${headerResponse.status} ${headerResponse.statusText}`);
      }
      
      const headerData = await headerResponse.json();
      const headers = headerData.values?.[0] || [];
      
      // Map rows to entries with headers as keys
      const formattedEntries = rows.map((row: any[], index: number) => {
        const entry: FormEntry = {
          id: index.toString(),
          name: row[1] || 'N/A', // Assuming name is in column B
          email: row[14] || 'N/A', // Parent's Email
          phone: row[12] || 'N/A', // Contact Number
          submittedAt: row[0] || 'N/A', // Assuming timestamp is in column A
          rowIndex: index + 2, // Google Sheets row index (1-based, + 1 for header, + 1 for 0-based index)
        };
        
        // Add all other columns dynamically
        headers.forEach((header, i) => {
          if (i < row.length && i >= 0) {
            entry[header.toString()] = row[i];
          }
        });
        
        return entry;
      });
      
      setEntries(formattedEntries);
      
      // Show notification for new entries
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
  };

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

  const handleAcceptEntry = async (entry: FormEntry) => {
    try {
      // Close the detail view dialog
      setIsDialogOpen(false);
      
      // Show feedback to user
      toast.success('Opening student form with prefilled data');
      
      // Trigger student form view in TableView component
      // We'll do this by dispatching a custom event that TableView will listen for
      const studentFormData = {
        // Map form fields to student database structure
        first_name: entry['First Name'] || '',
        last_name: entry['Last Name'] || '',
        gender: entry['Gender'] || '',
        dob: entry['Date of Birth'] || '',
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
        // Required fields for students table
        student_id: Math.floor(1000 + Math.random() * 9000), // Generate a random ID
        enrollment_year: new Date().getFullYear(),
        status: 'Active',
        student_email: entry["Parent's Email"] || '',
        program_id: 1,
        educator_employee_id: 1,
        center_id: 91
      };
      
      // Dispatch a custom event with the form data
      window.dispatchEvent(new CustomEvent('openStudentForm', { 
        detail: { 
          formData: studentFormData,
          sourceEntry: entry,
          onSuccess: async () => {
            // On successful student creation, remove the entry from Google Sheets
            try {
              await deleteFromGoogleSheet(entry.rowIndex);
              // Remove from local state too
              setEntries(prev => prev.filter(e => e.id !== entry.id));
              toast.success('Form entry removed from review list');
            } catch (err) {
              console.error('Error removing form entry:', err);
              toast.error('Student was added but entry could not be removed from review list');
            }
          }
        } 
      }));
    } catch (err) {
      console.error('Error accepting entry:', err);
      toast.error('Failed to process form submission');
    }
  };

  const handleRejectEntry = async (entry: FormEntry) => {
    try {
      // Show loading toast
      toast.loading('Rejecting entry...');
      
      // Delete the row from Google Sheets using batchUpdate API
      await deleteFromGoogleSheet(entry.rowIndex);
      
      // Remove from local state
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      toast.success('Entry rejected and removed');
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error rejecting entry:', err);
      toast.error('Failed to reject form submission. Please try again.');
    }
  };

  const deleteFromGoogleSheet = async (rowIndex: number) => {
    try {
      const API_KEY = 'AIzaSyACcbknWrMdZUapY8sQii16PclJ2xlPlqA';
      const SHEET_ID = '144Qh31BIIsDJYye5vWkE9WFhGI433yZU4TtKLq1wN4w';
      
      // First, get the sheet ID (needed for batch update)
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet info: ${response.status}`);
      }
      
      const spreadsheetData = await response.json();
      const sheet = spreadsheetData.sheets[0]; // Assuming we're working with first sheet
      const sheetId = sheet.properties.sheetId;
      
      // Now perform batch update to delete the row
      const batchUpdateRequest = {
        "requests": [
          {
            "deleteDimension": {
              "range": {
                "sheetId": sheetId,
                "dimension": "ROWS",
                "startIndex": rowIndex - 1, // Convert 1-based index to 0-based
                "endIndex": rowIndex // Non-inclusive end index
              }
            }
          }
        ]
      };
      
      const deleteResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batchUpdateRequest)
        }
      );
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        throw new Error(`Failed to delete row: ${deleteResponse.status} - ${errorText}`);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting row from Google Sheet:', err);
      throw err;
    }
  };

  const updateGoogleSheetEntry = async (entry: FormEntry, updatedData: Record<string, any>) => {
    try {
      const API_KEY = 'AIzaSyACcbknWrMdZUapY8sQii16PclJ2xlPlqA';
      const SHEET_ID = '144Qh31BIIsDJYye5vWkE9WFhGI433yZU4TtKLq1wN4w';
      
      // Get headers to know which column is which field
      const headerResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A1:Z1?key=${API_KEY}`
      );
      
      if (!headerResponse.ok) {
        throw new Error(`Failed to fetch headers: ${headerResponse.status} ${headerResponse.statusText}`);
      }
      
      const headerData = await headerResponse.json();
      const headers = headerData.values?.[0] || [];
      
      // Create row data with updated values
      const rowData = headers.map((header: string) => {
        if (updatedData[header] !== undefined) {
          return updatedData[header];
        }
        return entry[header] || '';
      });
      
      // Update the Google Sheet
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
        throw new Error(`Failed to update row: ${response.status} ${response.statusText} - ${errorData}`);
      }
      
      // Update local state
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
      await updateGoogleSheetEntry(selectedEntry, updatedData);
      setIsDialogOpen(false);
      fetchGoogleSheetData(); // Refresh data after update
    } catch (err) {
      console.error('Error saving edits:', err);
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-ishanya-yellow" />
              Pending Form Reviews
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchGoogleSheetData}
            >
              Refresh
            </Button>
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
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEntry(entry)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
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
              onAccept={handleAcceptEntry}
              onReject={handleRejectEntry}
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
    </>
  );
};

export default PendingReviews;
