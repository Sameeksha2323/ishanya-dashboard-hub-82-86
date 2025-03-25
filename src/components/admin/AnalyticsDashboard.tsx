
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface CenterData {
  center_id: number;
  name: string;
}

interface ProgramData {
  program_id: number;
  name: string;
}

interface StudentsByProgramData {
  name: string;
  total_students: number;
}

const AnalyticsDashboard = () => {
  const [centers, setCenters] = useState<CenterData[]>([]);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [studentsByProgram, setStudentsByProgram] = useState<StudentsByProgramData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data, error } = await supabase
          .from('centers')
          .select('center_id, name')
          .order('name');
          
        if (error) throw error;
        if (data) setCenters(data);
      } catch (error) {
        console.error('Error fetching centers:', error);
        toast.error('Failed to load centers');
      }
    };
    
    const fetchStudentsByProgram = async () => {
      try {
        // Use the RPC function to get students by program
        const { data, error } = await supabase
          .rpc('get_students_by_program');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Format the data for the pie chart
          const formattedData = data.map((item: any) => ({
            name: item.name,
            total_students: Number(item.total_students)
          }));
          
          setStudentsByProgram(formattedData);
        }
      } catch (error) {
        console.error('Error fetching students by program:', error);
        toast.error('Failed to load student program distribution');
        
        // Fallback to a database query if the function fails
        try {
          const { data, error: queryError } = await supabase
            .from('students')
            .select(`
              program_id,
              programs (
                name
              )
            `);
            
          if (queryError) throw queryError;
          
          if (data) {
            const programCounts: Record<string, number> = {};
            
            data.forEach(student => {
              const programName = student.programs?.name;
              if (programName) {
                programCounts[programName] = (programCounts[programName] || 0) + 1;
              }
            });
            
            const formattedData = Object.keys(programCounts).map(name => ({
              name,
              total_students: programCounts[name]
            }));
            
            setStudentsByProgram(formattedData);
          }
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCenters();
    fetchStudentsByProgram();
  }, []);
  
  useEffect(() => {
    const fetchPrograms = async () => {
      if (selectedCenter) {
        try {
          const { data, error } = await supabase
            .from('programs')
            .select('program_id, name, center_id')
            .eq('center_id', selectedCenter)
            .order('name');
            
          if (error) throw error;
          if (data) setPrograms(data);
        } catch (error) {
          console.error('Error fetching programs:', error);
          toast.error('Failed to load programs');
        }
      } else {
        setPrograms([]);
      }
    };
    
    fetchPrograms();
  }, [selectedCenter]);

  const handleCenterChange = (centerId: string) => {
    setSelectedCenter(parseInt(centerId));
    setSelectedProgram(null);
  };
  
  const handleProgramChange = (programId: string) => {
    setSelectedProgram(parseInt(programId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Student Program Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading data...</div>
              </div>
            ) : studentsByProgram.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsByProgram}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_students"
                    >
                      {studentsByProgram.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">No student data available</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Additional cards can be added here */}
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Overall statistics content */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="centers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Center</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCenter?.toString() || ''} onValueChange={handleCenterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.center_id} value={center.center_id.toString()}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select 
                    value={selectedCenter?.toString() || ''} 
                    onValueChange={handleCenterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.center_id} value={center.center_id.toString()}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCenter && (
                    <Select 
                      value={selectedProgram?.toString() || ''} 
                      onValueChange={handleProgramChange}
                      disabled={!selectedCenter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.program_id} value={program.program_id.toString()}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedProgram && (
                    <Button className="w-full">View Program Details</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
