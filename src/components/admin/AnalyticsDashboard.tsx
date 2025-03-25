
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#F4D03F', '#58D68D', '#EC7063', '#AF7AC5'];

interface AnalyticsData {
  studentsByProgram: { name: string; value: number }[];
  studentsByCenter: { name: string; value: number }[];
  educatorsByCenter: { name: string; value: number }[];
  studentsByDiagnosis: { name: string; value: number }[];
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>({
    studentsByProgram: [],
    studentsByCenter: [],
    educatorsByCenter: [],
    studentsByDiagnosis: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch programs for lookup
      const { data: programs } = await supabase
        .from('programs')
        .select('program_id, name');
      
      // Fetch centers for lookup
      const { data: centers } = await supabase
        .from('centers')
        .select('center_id, name');
      
      // Create lookup maps
      const programMap = new Map(programs?.map(p => [p.program_id, p.name]) || []);
      const centerMap = new Map(centers?.map(c => [c.center_id, c.name]) || []);
      
      // Students by program
      const { data: studentsByProgram, error: spError } = await supabase
        .from('students')
        .select('program_id, count')
        .select('program_id, count(*)')
        .group('program_id');
      
      if (spError) throw spError;
      
      // Students by center
      const { data: studentsByCenter, error: scError } = await supabase
        .from('students')
        .select('center_id, count(*)')
        .group('center_id');
      
      if (scError) throw scError;
      
      // Educators by center
      const { data: educatorsByCenter, error: ecError } = await supabase
        .from('educators')
        .select('center_id, count(*)')
        .group('center_id');
      
      if (ecError) throw ecError;
      
      // Students by primary diagnosis
      const { data: studentsByDiagnosis, error: sdError } = await supabase
        .from('students')
        .select('primary_diagnosis, count(*)')
        .not('primary_diagnosis', 'is', null)
        .group('primary_diagnosis');
      
      if (sdError) throw sdError;

      // Format data for charts
      const formattedData = {
        studentsByProgram: studentsByProgram.map(item => ({
          name: programMap.get(item.program_id) || `Program ${item.program_id}`,
          value: parseInt(item.count, 10)
        })),
        studentsByCenter: studentsByCenter.map(item => ({
          name: centerMap.get(item.center_id) || `Center ${item.center_id}`,
          value: parseInt(item.count, 10)
        })),
        educatorsByCenter: educatorsByCenter.map(item => ({
          name: centerMap.get(item.center_id) || `Center ${item.center_id}`,
          value: parseInt(item.count, 10)
        })),
        studentsByDiagnosis: studentsByDiagnosis.map(item => ({
          name: item.primary_diagnosis || 'Unknown',
          value: parseInt(item.count, 10)
        }))
      };
      
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.studentsByProgram}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.studentsByProgram.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentsByCenter}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Students" fill="#8884d8">
                  {data.studentsByCenter.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Educators by Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.educatorsByCenter}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Educators" fill="#82ca9d">
                  {data.educatorsByCenter.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.studentsByDiagnosis}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.studentsByDiagnosis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-semibold">{payload[0].name || label}</p>
        <p className="text-sm">
          <span className="font-medium">{payload[0].value}</span> {payload[0].dataKey === "value" ? "students" : ""}
        </p>
      </div>
    );
  }

  return null;
};

export default AnalyticsDashboard;
