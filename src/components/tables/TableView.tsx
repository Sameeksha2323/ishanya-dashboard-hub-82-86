import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Download, Upload, Search, X, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { fetchTableColumns } from '@/lib/api';
import { toast } from 'sonner';
import TableActions from './TableActions';
import CsvUpload from './CsvUpload';
import { TableFieldFormatter, capitalizeFirstLetter, isFieldRequired } from './TableFieldFormatter';
import { formatColumnName } from '@/utils/formEventUtils';

type TableViewProps = {
  table: any;
};

const TableView = ({ table }: TableViewProps) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formDataSource, setFormDataSource] = useState<any>(null);
  const [entityIdField, setEntityIdField] = useState<string>('id');
  const [processedColumns, setProcessedColumns] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tableName = table.name.toLowerCase();
        
        let idField = 'id';
        if (tableName === 'students') {
          idField = 'student_id';
        } else if (tableName === 'employees') {
          idField = 'employee_id';
        } else if (tableName === 'educators') {
          idField = 'employee_id';
        }
        
        setEntityIdField(idField);
        
        const columnsData = await fetchTableColumns(tableName);
        if (!columnsData) {
          setError('Failed to fetch table columns');
          return;
        }
        
        setColumns(columnsData);
        
        const uniqueColumns = [...new Set(columnsData)].filter(col => {
          if (col === 'enrollment_year' && 
              columnsData.indexOf(col) !== columnsData.lastIndexOf(col)) {
            return columnsData.indexOf(col) === columnsData.indexOf('enrollment_year');
          }
          return true;
        });
        
        setProcessedColumns(uniqueColumns);
        
        let query = supabase.from(tableName).select('*');
        
        if (tableName.toLowerCase() === 'students' && table.center_id) {
          query = query.eq('center_id', table.center_id);
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
        
        const defaultFormData: Record<string, any> = {};
        uniqueColumns.forEach(col => {
          if (col !== 'created_at' && col !== 'updated_at') {
            defaultFormData[col] = '';
          }
        });
        
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

    const handleOpenStudentForm = (event: CustomEvent<any>) => {
      if (table.name.toLowerCase() === 'students') {
        const { formData: prefillData, sourceEntry, onSuccess } = event.detail;
        
        setFormData(prefillData);
        setFormDataSource({ sourceEntry, onSuccess });
        setIsEditing(false);
        setSelectedRow(null);
        setShowForm(true);
        toast.success('Student form opened with prefilled data');
      }
    };

    window.addEventListener('openStudentForm', handleOpenStudentForm as EventListener);

    return () => {
      window.removeEventListener('openStudentForm', handleOpenStudentForm as EventListener);
    };
  }, [table]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      return Object.entries(item).some(([key, value]) => {
        if (
          value !== null &&
          typeof value !== 'object' &&
          value.toString().toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }
        return false;
      });
    });
    
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setIsEditing(true);
    
    const rowFormData: Record<string, any> = {};
    columns.forEach(col => {
      if (col !== 'created_at') {
        rowFormData[col] = row[col] !== null ? row[col] : '';
      }
    });
    
    setFormData(rowFormData);
    setShowForm(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleAddToEducators = async (employeeData: any) => {
    try {
      const { data: existingEducator, error: checkError } = await supabase
        .from('educators')
        .select('*')
        .eq('employee_id', employeeData.employee_id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing educator:', checkError);
        throw new Error('Failed to check if employee is already an educator');
      }
      
      if (existingEducator) {
        toast.error('This employee is already registered as an educator');
        return;
      }
      
      const { data: educatorData, error: educatorError } = await supabase
        .from('educators')
        .insert({
          employee_id: employeeData.employee_id,
          center_id: employeeData.center_id,
          name: employeeData.name,
          designation: employeeData.designation,
          email: employeeData.email,
          phone: employeeData.phone,
          date_of_birth: employeeData.date_of_birth,
          date_of_joining: employeeData.date_of_joining,
          work_location: employeeData.work_location || null,
          status: employeeData.status || 'Active',
          photo: employeeData.photo || null
        })
        .select();
        
      if (educatorError) {
        console.error('Error adding educator:', educatorError);
        throw new Error('Failed to add educator record');
      }
      
      toast.success('Employee successfully added as an educator');
      
      if (table.name.toLowerCase() === 'educators') {
        window.location.reload();
      }
      
      return educatorData;
    } catch (err) {
      console.error('Error in handleAddToEducators:', err);
      throw err;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tableName = table.name.toLowerCase();
      
      const updateData: Record<string, any> = {};
      columns.forEach(col => {
        if (col !== 'created_at' && col !== 'updated_at') {
          updateData[col] = formData[col] !== undefined ? formData[col] : null;
        }
      });
      
      const idField = entityIdField;
      
      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(idField, selectedRow[idField])
        .select();
        
      if (updateError) {
        console.error('Error updating record:', updateError);
        toast.error('Failed to update record: ' + updateError.message);
        return;
      }
      
      toast.success('Record updated successfully');
      
      setData(data.map(item => (item[idField] === selectedRow[idField] ? updatedData[0] : item)));
      setFilteredData(filteredData.map(item => (item[idField] === selectedRow[idField] ? updatedData[0] : item)));
      setShowForm(false);
      
      if (tableName === 'employees' && formData.is_educator === true) {
        try {
          await handleAddToEducators(updatedData[0]);
        } catch (err) {
          console.error('Error handling educator record:', err);
        }
      }
      
    } catch (err) {
      console.error('Error in handleSave:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tableName = table.name.toLowerCase();
      
      const insertData: Record<string, any> = {};
      columns.forEach(col => {
        if (col !== 'created_at' && col !== 'updated_at' && formData[col] !== undefined) {
          insertData[col] = formData[col] !== null && formData[col] !== '' ? formData[col] : null;
        }
      });
      
      if (tableName === 'educators' && !insertData.employee_id) {
        toast.error('Employee ID is required for educators');
        setLoading(false);
        return;
      }
      
      console.log("Inserting data:", insertData);
      
      const { data: newRecord, error: insertError } = await supabase
        .from(tableName)
        .insert([insertData])
        .select();
        
      if (insertError) {
        console.error('Error inserting record:', insertError);
        toast.error(`Error inserting record: ${insertError.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Record added successfully');
      
      if (tableName === 'employees' && formData.is_educator === true) {
        try {
          await handleAddToEducators(newRecord[0]);
        } catch (err) {
          console.error('Error handling educator record:', err);
        }
      }
      
      setData([...data, newRecord[0]]);
      setFilteredData([...filteredData, newRecord[0]]);
      setShowForm(false);
      
      if (formDataSource && formDataSource.onSuccess) {
        try {
          await formDataSource.onSuccess();
          setFormDataSource(null);
        } catch (cbError) {
          console.error('Error in form submission callback:', cbError);
        }
      }
      
    } catch (err) {
      console.error('Error in handleAdd:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        setLoading(true);
        setError(null);
        
        const tableName = table.name.toLowerCase();
        const idField = entityIdField;
        
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq(idField, row[idField]);
          
        if (deleteError) {
          console.error('Error deleting record:', deleteError);
          toast.error('Failed to delete record');
          return;
        }
        
        toast.success('Record deleted successfully');
        
        setData(data.filter(item => item[idField] !== row[idField]));
        setFilteredData(filteredData.filter(item => item[idField] !== row[idField]));
        
      } catch (err) {
        console.error('Error in handleDelete:', err);
        setError('Failed to delete record');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && data.length === 0) {
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

  const displayColumns = processedColumns.filter(column => {
    if (column === 'created_at' || column === 'updated_at') return false;
    
    if (column === 'enrollment_year' && 
        processedColumns.indexOf(column) !== processedColumns.lastIndexOf(column)) {
      return processedColumns.indexOf(column) === processedColumns.indexOf('enrollment_year');
    }
    
    return true;
  });

  return (
    <div>
      <TableActions
        tableName={table.name}
        onInsert={() => {
          setShowForm(true);
          setIsEditing(false);
          setSelectedRow(null);
          setFormDataSource(null);
          
          const defaultFormData: Record<string, any> = {};
          displayColumns.forEach(col => {
            if (col !== 'created_at' && col !== 'updated_at') {
              defaultFormData[col] = '';
            }
          });
          
          if (table.center_id) {
            defaultFormData.center_id = table.center_id;
          }
          
          if (table.program_id) {
            defaultFormData.program_id = table.program_id;
          }
          
          setFormData(defaultFormData);
        }}
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
      
      {showForm && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>{isEditing ? 'Edit Record' : 'Add Record'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayColumns.map((column) => {
                if (column === 'created_at' || column === 'updated_at') return null;
                
                if (column === 'enrollment_year' && 
                    processedColumns.indexOf(column) !== processedColumns.lastIndexOf(column) &&
                    processedColumns.indexOf(column) !== processedColumns.indexOf('enrollment_year')) {
                  return null;
                }
                
                const isRequired = isFieldRequired(table.name.toLowerCase(), column);
                
                const isReadOnly = (
                  (column === 'center_id' && table.center_id !== undefined && table.center_id !== null) || 
                  (column === 'program_id' && table.program_id !== undefined && table.program_id !== null)
                );
                
                return (
                  <div key={column} className="space-y-2">
                    <Label htmlFor={column}>
                      {formatColumnName(column)}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <TableFieldFormatter
                      fieldName={column}
                      value={formData[column]}
                      onChange={(value) => handleInputChange(column, value)}
                      isEditing={!isReadOnly}
                      isRequired={isRequired}
                      tableName={table.name.toLowerCase()}
                      entityId={formData[entityIdField]}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={isEditing ? handleSave : handleAdd} disabled={loading}>
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {isEditing ? 'Save Changes' : 'Add Record'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-white rounded-md shadow mb-6 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {table.display_name || table.name} ({filteredData.length})
            </h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {displayColumns.slice(0, 6).map((column) => (
                  <TableHead key={column}>
                    {formatColumnName(column)}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={displayColumns.slice(0, 6).length + 1} className="h-24 text-center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row[entityIdField]}>
                    {displayColumns.slice(0, 6).map((column) => (
                      <TableCell key={column}>
                        <TableFieldFormatter
                          fieldName={column}
                          value={row[column]}
                          onChange={() => {}}
                          isEditing={false}
                          tableName={table.name.toLowerCase()}
                          entityId={row[entityIdField]}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRowClick(row)}
                        >
                          <Edit className="h-4 w-4" />
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
    </div>
  );
};

export default TableView;
