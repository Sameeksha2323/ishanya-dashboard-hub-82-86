
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

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
      
      // Run SQL directly to get the counts
      const { data: studentsByProgramRaw } = await supabase.rpc('run_sql', {
        query: 'SELECT program_id, COUNT(*) FROM students GROUP BY program_id'
      });
      
      const { data: studentsByCenterRaw } = await supabase.rpc('run_sql', {
        query: 'SELECT center_id, COUNT(*) FROM students GROUP BY center_id'
      });
      
      const { data: educatorsByCenterRaw } = await supabase.rpc('run_sql', {
        query: 'SELECT center_id, COUNT(*) FROM educators GROUP BY center_id'
      });
      
      const { data: studentsByDiagnosisRaw } = await supabase.rpc('run_sql', {
        query: 'SELECT primary_diagnosis, COUNT(*) FROM students WHERE primary_diagnosis IS NOT NULL GROUP BY primary_diagnosis'
      });
      
      // Process raw SQL results
      const studentsByProgram = studentsByProgramRaw ? studentsByProgramRaw.map((item: any) => {
        const result = item.result;
        return {
          name: programMap.get(Number(result.program_id)) || `Program ${result.program_id}`,
          value: parseInt(result.count, 10)
        };
      }) : [];
      
      const studentsByCenter = studentsByCenterRaw ? studentsByCenterRaw.map((item: any) => {
        const result = item.result;
        return {
          name: centerMap.get(Number(result.center_id)) || `Center ${result.center_id}`,
          value: parseInt(result.count, 10)
        };
      }) : [];
      
      const educatorsByCenter = educatorsByCenterRaw ? educatorsByCenterRaw.map((item: any) => {
        const result = item.result;
        return {
          name: centerMap.get(Number(result.center_id)) || `Center ${result.center_id}`,
          value: parseInt(result.count, 10)
        };
      }) : [];
      
      const studentsByDiagnosis = studentsByDiagnosisRaw ? studentsByDiagnosisRaw.map((item: any) => {
        const result = item.result;
        return {
          name: result.primary_diagnosis || 'Unknown',
          value: parseInt(result.count, 10)
        };
      }) : [];
      
      setData({
        studentsByProgram,
        studentsByCenter,
        educatorsByCenter,
        studentsByDiagnosis
      });
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
