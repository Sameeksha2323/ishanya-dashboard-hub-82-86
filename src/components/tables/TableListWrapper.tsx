
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableInfo, fetchTablesByProgram } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Program } from '@/lib/api';
import { Users, UserRound } from 'lucide-react';

type TableListWrapperProps = {
  program: Program;
  onSelectTable: (table: TableInfo) => void;
  selectedTable: TableInfo | null;
};

const TableListWrapper = ({ program, onSelectTable, selectedTable }: TableListWrapperProps) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        
        // Only include students and employees tables
        const filteredTables = [
          { 
            id: 1, 
            name: 'students', 
            program_id: program.program_id, 
            description: 'Student information',
            display_name: 'Students',
            center_id: program.center_id
          },
          { 
            id: 3, 
            name: 'employees', 
            program_id: program.program_id, 
            description: 'Employee information',
            display_name: 'Employees',
            center_id: program.center_id
          }
        ];
        
        setTables(filteredTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setError('Failed to load tables. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [program]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tables.map((table) => (
        <Card 
          key={table.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectTable(table)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {table.name === 'students' ? (
                <Users className="h-5 w-5 text-blue-500" />
              ) : (
                <UserRound className="h-5 w-5 text-purple-500" />
              )}
              {table.display_name || table.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{table.description}</p>
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTable(table);
              }}
            >
              Manage {table.display_name || table.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TableListWrapper;
