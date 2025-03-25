
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentsByProgram, setStudentsByProgram] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch student counts by program
        const { data: programStudentCounts, error: programError } = await supabase
          .from('students')
          .select(`
            program_id,
            programs:programs!inner(
              program_id,
              name
            )
          `)
          .then(({ data, error }) => {
            if (error) throw error;
            
            // Count students by program
            const programCounts = data.reduce((acc, curr) => {
              const programName = curr.programs?.name || 'Unknown Program';
              acc[programName] = (acc[programName] || 0) + 1;
              return acc;
            }, {});
            
            // Convert to array format for PieChart
            return {
              data: Object.entries(programCounts).map(([name, value]) => ({
                name,
                value
              })),
              error: null
            };
          });

        if (programError) {
          console.error('Error fetching student program data:', programError);
          setLoading(false);
          return;
        }
        
        setStudentsByProgram(programStudentCounts || []);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Colors for the pie chart
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
  
  // Custom tooltip for pie chart - Fixed the type issue
  const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded">
          <p className="font-medium">{payload[0].name}</p>
          <p>Students: <span className="font-bold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="students" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="educators">Educators</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Students by Program</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <LoadingSpinner />
                  </div>
                ) : studentsByProgram.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentsByProgram}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {studentsByProgram.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No student data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="educators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Educators Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Educator analytics coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Performance analytics coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
