
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Download, Upload, Search, X, Filter, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { fetchTableColumns } from '@/lib/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableActions from './TableActions';
import CsvUpload from './CsvUpload';
import { TableFieldFormatter, capitalizeFirstLetter } from './TableFieldFormatter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';

// List of required fields by table
const requiredFields = {
  students: [
    'first_name', 'last_name', 'gender', 'dob', 'student_id', 'enrollment_year', 
    'status', 'student_email', 'program_id', 'educator_employee_id', 'contact_number', 'center_id'
  ],
  educators: [
    'center_id', 'employee_id', 'name', 'designation', 'email', 'phone', 
    'date_of_birth', 'date_of_joining', 'work_location'
  ],
  employees: [
    'employee_id', 'name', 'gender', 'designation', 'department', 'employment_type', 
    'email', 'phone', 'date_of_birth', 'date_of_joining', 'emergency_contact_name', 
    'emergency_contact', 'center_id', 'password'
  ]
};

type FilteredTableViewProps = {
  table: any;
};

const FilteredTableView = ({ table }: FilteredTableViewProps) => {
  const user = getCurrentUser();
  const userRole = user?.role || '';
  
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [lastRecordId, setLastRecordId] = useState<number | null>(null);
  const [filterColumn, setFilterColumn] = useState<string>('all');
  const [isFormEditing, setIsFormEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tableName = table.name.toLowerCase();
        
        // Fetch columns first
        const columnsData = await fetchTableColumns(tableName);
        if (!columnsData) {
          setError('Failed to fetch table columns');
          return;
        }
        
        setColumns(columnsData);
        
        // Fetch table data with proper filtering
        let query = supabase.from(tableName).select('*');
        
        // Apply filters based on table name and available filters
        if (tableName === 'students') {
          if (table.center_id) {
            query = query.eq('center_id', table.center_id);
          }
          if (table.program_id) {
            query = query.eq('program_id', table.program_id);
          }
        } else if (table.center_id) {
          query = query.eq('center_id', table.center_id);
        }
        
        const { data: tableData, error: fetchError } = await query;
        
        if (fetchError) {
          console.error('Error fetching data:', fetchError);
          setError('Failed to fetch data');
          return;
        }
        
        setData(tableData || []);
        setFilteredData(tableData || []);
        
        // Get the highest ID value for reference
        if (tableData && tableData.length > 0) {
          const validData = tableData as Array<Record<string, any>>;
          
          if (tableName === 'students') {
            const maxId = Math.max(...validData.map(item => Number(item.student_id) || 0));
            setLastRecordId(maxId);
          } else if (tableName === 'employees' || tableName === 'educators') {
            const maxId = Math.max(...validData.map(item => Number(item.employee_id) || 0));
            setLastRecordId(maxId);
          } else if (tableName === 'centers') {
            const maxId = Math.max(...validData.map(item => Number(item.center_id) || 0));
            setLastRecordId(maxId);
          }
        }
        
        // Initialize default form data
        const defaultFormData: Record<string, any> = {};
        columnsData.forEach(col => {
          defaultFormData[col] = '';
        });
        
        // Add center_id and program_id from table if available
        if (table.center_id) {
          defaultFormData.center_id = table.center_id;
        }
        if (table.program_id) {
          defaultFormData.program_id = table.program_id;
        }
        
        setFormData(defaultFormData);
        
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [table]);

  // Filter data based on search term and column
  useEffect(() => {
    if (data.length === 0) return;
    
    let filtered = [...data];
    
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      
      if (filterColumn === 'all') {
        filtered = filtered.filter(item => {
          return Object.entries(item).some(([key, value]) => {
            if (
              value !== null &&
              typeof value !== 'object' &&
              String(value).toLowerCase().includes(searchTermLower)
            ) {
              return true;
            }
            return false;
          });
        });
      } else {
        filtered = filtered.filter(item => {
          const value = item[filterColumn];
          return value !== null && 
                 typeof value !== 'object' && 
                 String(value).toLowerCase().includes(searchTermLower);
        });
      }
    }
    
    setFilteredData(filtered);
  }, [searchTerm, filterColumn, data]);

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setIsEditing(false);
    
    // Copy row data to form
    const rowFormData: Record<string, any> = {};
    columns.forEach(col => {
      rowFormData[col] = row[col] !== null ? row[col] : '';
    });
    
    setFormData(rowFormData);
    setShowDetails(true);
  };

  const handleEditClick = () => {
    setIsFormEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const tableName = table.name.toLowerCase();
      const idField = tableName === 'students' ? 'student_id' : 
                      (tableName === 'employees' || tableName === 'educators') ? 'employee_id' : 'id';
      
      // Check if this is a new record or an update
      if (selectedRow) {
        // Update existing record
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq(idField, selectedRow[idField]);
        
        if (error) {
          console.error('Error updating record:', error);
          toast.error('Failed to update record', { duration: 3000 });
          return;
        }
        
        // If it's employee or educator, sync data between the tables
        if ((tableName === 'employees' || tableName === 'educators') && 
            formData.employee_id && formData.department === 'Education') {
          
          const sharedFields = ['name', 'email', 'phone', 'work_location', 'date_of_birth', 'date_of_joining', 'center_id'];
          const syncData: Record<string, any> = {};
          
          sharedFields.forEach(field => {
            if (formData[field] !== undefined) {
              syncData[field] = formData[field];
            }
          });
          
          if (Object.keys(syncData).length > 0) {
            const otherTable = tableName === 'employees' ? 'educators' : 'employees';
            const { error: syncError } = await supabase
              .from(otherTable)
              .update(syncData)
              .eq('employee_id', formData.employee_id);
              
            if (syncError) {
              console.error(`Error syncing with ${otherTable}:`, syncError);
            }
          }
        }
        
        toast.success('Record updated successfully', { duration: 3000 });
        
        // Update the records in the UI
        const updatedData = data.map(item => 
          item[idField] === selectedRow[idField] ? { ...item, ...formData } : item
        );
        setData(updatedData);
        setFilteredData(updatedData);
      } else {
        // Insert new record
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(formData)
          .select();
        
        if (error) {
          console.error('Error inserting record:', error);
          toast.error('Failed to insert record', { duration: 3000 });
          return;
        }
        
        // If it's employee or educator with Education department, create in both tables
        if ((tableName === 'employees' || tableName === 'educators') && 
            formData.employee_id && formData.department === 'Education') {
          
          const sharedFields = ['employee_id', 'name', 'email', 'phone', 'work_location', 'date_of_birth', 'date_of_joining', 'center_id'];
          const syncData: Record<string, any> = {};
          
          sharedFields.forEach(field => {
            if (formData[field] !== undefined) {
              syncData[field] = formData[field];
            }
          });
          
          const otherTable = tableName === 'employees' ? 'educators' : 'employees';
          
          // Check if record already exists in the other table
          const { data: existingData } = await supabase
            .from(otherTable)
            .select('*')
            .eq('employee_id', formData.employee_id)
            .limit(1);
            
          if (existingData && existingData.length === 0) {
            const { error: syncError } = await supabase
              .from(otherTable)
              .insert(syncData);
              
            if (syncError) {
              console.error(`Error syncing with ${otherTable}:`, syncError);
            }
          }
        }
        
        toast.success('Record added successfully', { duration: 3000 });
        
        // Update the records in the UI
        if (insertedData && insertedData.length > 0) {
          const newData = [...data, ...insertedData];
          setData(newData);
          setFilteredData(newData);
          
          // Update last record ID
          if (tableName === 'students') {
            const studentId = insertedData[0].student_id as number;
            if (studentId) {
              setLastRecordId(studentId);
            }
          } else if ((tableName === 'employees' || tableName === 'educators')) {
            const employeeId = insertedData[0].employee_id as number;
            if (employeeId) {
              setLastRecordId(employeeId);
            }
          } else if (tableName === 'centers') {
            const centerId = insertedData[0].center_id as number;
            if (centerId) {
              setLastRecordId(centerId);
            }
          }
        }
      }
      
      setShowDetails(false);
      setShowForm(false);
      setIsFormEditing(false);
      setSelectedRow(null);
      
    } catch (err) {
      console.error('Error in save:', err);
      toast.error('An unexpected error occurred', { duration: 3000 });
    }
  };

  const handleDelete = async (row: any) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const tableName = table.name.toLowerCase();
        const idField = tableName === 'students' ? 'student_id' : 
                       (tableName === 'employees' || tableName === 'educators') ? 'employee_id' : 'id';
        
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(idField, row[idField]);
        
        if (error) {
          console.error('Error deleting record:', error);
          toast.error('Failed to delete record', { duration: 3000 });
          return;
        }
        
        toast.success('Record deleted successfully', { duration: 3000 });
        
        // Update the records in the UI
        const updatedData = data.filter(item => item[idField] !== row[idField]);
        setData(updatedData);
        setFilteredData(updatedData);
        
        // Close dialog if the deleted record was being viewed
        if (selectedRow && selectedRow[idField] === row[idField]) {
          setShowDetails(false);
          setSelectedRow(null);
        }
      } catch (err) {
        console.error('Error in delete:', err);
        toast.error('An unexpected error occurred', { duration: 3000 });
      }
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a FileReader to read the file as a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Set the data URL as the value for the photo field
        setFormData(prev => ({ ...prev, photo: dataUrl }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo', { duration: 3000 });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <TableActions
        tableName={table.name}
        onInsert={() => {
          // Reset form with default values and increment the ID
          const defaultFormData: Record<string, any> = {};
          const tableName = table.name.toLowerCase();
          
          columns.forEach(col => {
            if (col === 'student_id' || col === 'employee_id' || col === 'center_id') {
              defaultFormData[col] = lastRecordId ? lastRecordId + 1 : 1;
            } else {
              defaultFormData[col] = '';
            }
          });
          
          // Add center_id and program_id from table if available
          if (table.center_id) {
            defaultFormData.center_id = table.center_id;
          }
          if (table.program_id) {
            defaultFormData.program_id = table.program_id;
          }
          
          setFormData(defaultFormData);
          setSelectedRow(null);
          setIsFormEditing(true);
          setShowDetails(true);
        }}
        onUpload={() => setShowUpload(true)}
        onRefresh={() => window.location.reload()}
      />
      
      {showUpload && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Upload CSV</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CsvUpload
              tableName={table.name}
              onSuccess={() => {
                setShowUpload(false);
                window.location.reload();
              }}
              onClose={() => setShowUpload(false)}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-md shadow mb-6 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">
              {table.display_name || table.name} ({filteredData.length})
            </h2>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Select 
                  value={filterColumn} 
                  onValueChange={setFilterColumn}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Columns</SelectItem>
                    {columns.slice(0, 10).map((column) => (
                      <SelectItem key={column} value={column}>
                        {capitalizeFirstLetter(column)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${filterColumn === 'all' ? 'all columns' : capitalizeFirstLetter(filterColumn)}...`}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.slice(0, 6).map((column) => (
                  <TableHead key={column}>
                    {capitalizeFirstLetter(column)}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.slice(0, 6).length + 1} className="h-24 text-center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id || row.student_id || row.employee_id}>
                    {columns.slice(0, 6).map((column) => (
                      <TableCell key={column}>
                        {column === 'password' ? 
                          '••••••••' : 
                          (row[column] !== null && row[column] !== undefined
                            ? typeof row[column] === 'object'
                              ? JSON.stringify(row[column])
                              : String(row[column])
                            : '-')}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRowClick(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details/Edit Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isFormEditing 
                ? (selectedRow ? 'Edit' : 'Add') + ` ${table.name.slice(0, -1)}`
                : `${capitalizeFirstLetter(table.name.slice(0, -1))} Details`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {!isFormEditing && (
              <div className="flex justify-end mb-4">
                <Button onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {columns.filter(col => col !== 'id').map((column) => {
                // Skip password field for non-admin users unless creating/editing
                if (column === 'password' && 
                    !isFormEditing && 
                    userRole !== 'administrator') {
                  return null;
                }
                
                // Special handling for photo field
                if (column === 'photo' && isFormEditing) {
                  return (
                    <div key={column} className="space-y-2">
                      <Label>
                        {capitalizeFirstLetter(column)}
                        {isFormEditing && 
                         requiredFields[table.name.toLowerCase() as keyof typeof requiredFields]?.includes(column) && 
                         <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="flex flex-col gap-2">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload}
                        />
                        {formData.photo && (
                          <div className="mt-2">
                            <img 
                              src={formData.photo} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // For everything else
                return (
                  <div key={column} className="space-y-2">
                    <Label>
                      {capitalizeFirstLetter(column)}
                      {isFormEditing && 
                       requiredFields[table.name.toLowerCase() as keyof typeof requiredFields]?.includes(column) && 
                       <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <TableFieldFormatter
                      fieldName={column}
                      value={formData[column]}
                      onChange={(value) => handleInputChange(column, value)}
                      isEditing={isFormEditing}
                      isRequired={requiredFields[table.name.toLowerCase() as keyof typeof requiredFields]?.includes(column)}
                    />
                  </div>
                );
              })}
            </div>
            
            {isFormEditing && (
              <div className="flex justify-end mt-6 space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsFormEditing(false);
                    if (!selectedRow) {
                      setShowDetails(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveClick}>Save</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilteredTableView;
