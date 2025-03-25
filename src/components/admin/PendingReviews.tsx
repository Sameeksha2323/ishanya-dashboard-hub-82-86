
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Eye, Check, X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DetailedFormView from './DetailedFormView';

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
      toast.loading('Preparing student form with prefilled data...');
  
      // Map form fields to match student database
      const studentFormData = {
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
        // Required fields for student table
        enrollment_year: new Date().getFullYear(),
        status: 'Active',
        student_email: entry["Parent's Email"] || '',
        program_id: 1, // Default program ID
        center_id: 91 // Default center ID
      };
  
      // Dispatch event to open the form with prefilled data in TableActions.tsx
      window.dispatchEvent(new CustomEvent('openAddRecordForm', {
        detail: { 
          tableName: 'students',
          formData: studentFormData,
          sourceEntry: entry,
          onSuccess: async () => {
            try {
              // Delete the entry from Google Sheets after successful form submission
              const deleteResult = await deleteFromGoogleSheet(entry.rowIndex);
              if (deleteResult) {
                // Remove entry from local state
                setEntries(prev => prev.filter(e => e.id !== entry.id));
                toast.success('Form entry successfully processed and removed from review list');
              } else {
                toast.error('Student was added but entry could not be removed from review list');
              }
            } catch (err) {
              console.error('Error removing form entry:', err);
              toast.error('Student was added but entry could not be removed from review list');
            }
          }
        } 
      }));
  
      // Show success toast
      toast.dismiss();
      toast.success('Opening student form with prefilled data');
  
    } catch (err) {
      console.error('Error accepting entry:', err);
      toast.error('Failed to process form submission');
    }
  };
  

  const handleRejectEntry = async (entry: FormEntry) => {
    try {
      const loadingToast = toast.loading('Rejecting entry...');
      
      // Delete the row from Google Sheets using batchUpdate API
      const deleteResult = await deleteFromGoogleSheet(entry.rowIndex);
      
      if (deleteResult) {
        // Remove from local state
        setEntries(prev => prev.filter(e => e.id !== entry.id));
        toast.success('Entry rejected and removed');
      } else {
        toast.error('Failed to reject form submission. Please try again.');
      }
      
      toast.dismiss(loadingToast);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error rejecting entry:', err);
      toast.error('Failed to reject form submission. Please try again.');
    }
  };

  const deleteFromGoogleSheet = async (rowIndex: number) => {
    try {
      console.log(`Attempting to delete row at index ${rowIndex}`);
      
      const API_KEY = 'AIzaSyACcbknWrMdZUapY8sQii16PclJ2xlPlqA';
      const SHEET_ID = '144Qh31BIIsDJYye5vWkE9WFhGI433yZU4TtKLq1wN4w';
      
      // First, get the spreadsheet info to identify the correct sheet
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch spreadsheet info: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch spreadsheet info: ${response.status}`);
      }
      
      const spreadsheetData = await response.json();
      console.log('Spreadsheet data:', spreadsheetData);
      
      // Find the correct sheet by name
      const formResponsesSheet = spreadsheetData.sheets.find(
        (sheet: any) => sheet.properties.title === 'Form Responses 1'
      );
      
      if (!formResponsesSheet) {
        console.error('Could not find Form Responses 1 sheet');
        throw new Error('Could not find Form Responses 1 sheet');
      }
      
      const sheetId = formResponsesSheet.properties.sheetId;
      console.log(`Found sheet ID: ${sheetId}`);
      
      // Calculate the correct row indexes (0-based in API)
      const zeroBasedIndex = rowIndex - 1;
      
      // Now perform batch update to delete the row
      const batchUpdateRequest = {
        "requests": [
          {
            "deleteDimension": {
              "range": {
                "sheetId": sheetId,
                "dimension": "ROWS",
                "startIndex": zeroBasedIndex, 
                "endIndex": zeroBasedIndex + 1 // Non-inclusive end index
              }
            }
          }
        ]
      };
      
      console.log('Sending batch update request:', JSON.stringify(batchUpdateRequest));
      
      // Need to use OAuth token for write operations
      // For this demo we'll use the workaround with a POST request
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
      
      console.log('Delete response status:', deleteResponse.status);
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error(`Failed to delete row: ${deleteResponse.status} - ${errorText}`);
        
        // As a fallback, try to clear the row instead of deleting it
        const clearRequest = {
          "requests": [
            {
              "updateCells": {
                "range": {
                  "sheetId": sheetId,
                  "startRowIndex": zeroBasedIndex,
                  "endRowIndex": zeroBasedIndex + 1,
                  "startColumnIndex": 0,
                  "endColumnIndex": 100 // Use a large number to cover all columns
                },
                "fields": "userEnteredValue"
              }
            }
          ]
        };
        
        console.log('Trying fallback: clear row request');
        
        const clearResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate?key=${API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(clearRequest)
          }
        );
        
        if (!clearResponse.ok) {
          const clearErrorText = await clearResponse.text();
          console.error(`Failed to clear row: ${clearResponse.status} - ${clearErrorText}`);
          return false;
        }
        
        console.log('Successfully cleared the row as fallback');
        return true;
      }
      
      console.log('Successfully deleted the row');
      return true;
    } catch (err) {
      console.error('Error in deleteFromGoogleSheet:', err);
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
        const errorText = await headerResponse.text();
        console.error(`Failed to fetch headers: ${headerResponse.status} - ${errorText}`);
        throw new Error(`Failed to fetch headers: ${headerResponse.status} ${headerResponse.statusText}`);
      }
      
      const headerData = await headerResponse.json();
      const headers = headerData.values?.[0] || [];
      
      // First get the current row data to ensure we don't lose anything
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
      
      // Create row data with updated values, preserving existing ones
      const rowData = headers.map((header: string, index: number) => {
        if (updatedData[header] !== undefined) {
          return updatedData[header];
        } else if (index < currentValues.length) {
          return currentValues[index];
        }
        return '';
      });
      
      console.log('Updating row with data:', rowData);
      
      // Update the Google Sheet
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Form Responses 1!A${entry.rowIndex}:Z${entry.rowIndex}?valueInputOption=RAW&key=${API_KEY}`,
        {
          method: 'PUT', // Using PUT to replace the entire row
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
      const updateResult = await updateGoogleSheetEntry(selectedEntry, updatedData);
      if (updateResult) {
        setIsDialogOpen(false);
        fetchGoogleSheetData(); // Refresh data after update
      }
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
