
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type FormEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  [key: string]: any;
};

const PendingReviews = () => {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          email: row[2] || 'N/A', // Assuming email is in column C
          phone: row[3] || 'N/A', // Assuming phone is in column D
          submittedAt: row[0] || 'N/A', // Assuming timestamp is in column A
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
    // For now, just display the entry details in console
    console.log('View entry details:', entry);
    toast.info('Entry details opened');
    // In a real implementation, this would open a modal or navigate to a detail page
  };

  const handleAcceptEntry = (entry: FormEntry) => {
    console.log('Accept entry:', entry);
    toast.success('Entry accepted');
    // In a real implementation, this would fill the student form and then remove from Google Sheet
  };

  const handleRejectEntry = (entry: FormEntry) => {
    console.log('Reject entry:', entry);
    toast.success('Entry rejected');
    // In a real implementation, this would remove the entry from Google Sheet
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
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.phone}</TableCell>
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
  );
};

export default PendingReviews;
