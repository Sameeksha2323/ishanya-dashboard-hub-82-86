
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#F4D03F', '#58D68D', '#EC7063', '#AF7AC5'];

interface AnalyticsData {
  studentsByProgram: { name: string; value: number }[];
  studentsByCenter: { name: string; value: number }[];
  educatorsByCenter: { name: string; value: number }[];
  studentsByDiagnosis: { name: string; value: number }[];
  teacherToStudentRatio: { name: string; ratio: number }[];
  studentsByStatus: { name: string; value: number }[];
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>({
    studentsByProgram: [],
    studentsByCenter: [],
    educatorsByCenter: [],
    studentsByDiagnosis: [],
    teacherToStudentRatio: [],
    studentsByStatus: []
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
      
      // Using RPC for SQL queries
      const { data: studentsByProgramRaw, error: spError } = await supabase.rpc('run_sql', {
        query: 'SELECT program_id, COUNT(*) FROM students GROUP BY program_id'
      });
      
      const { data: studentsByCenterRaw, error: scError } = await supabase.rpc('run_sql', {
        query: 'SELECT center_id, COUNT(*) FROM students GROUP BY center_id'
      });
      
      const { data: educatorsByCenterRaw, error: ecError } = await supabase.rpc('run_sql', {
        query: 'SELECT center_id, COUNT(*) FROM educators GROUP BY center_id'
      });
      
      const { data: studentsByDiagnosisRaw, error: sdError } = await supabase.rpc('run_sql', {
        query: 'SELECT primary_diagnosis, COUNT(*) FROM students WHERE primary_diagnosis IS NOT NULL GROUP BY primary_diagnosis'
      });
      
      const { data: studentsByStatusRaw, error: ssError } = await supabase.rpc('run_sql', {
        query: 'SELECT status, COUNT(*) FROM students GROUP BY status'
      });
      
      if (spError || scError || ecError || sdError || ssError) {
        console.error('Error fetching analytics data:', spError || scError || ecError || sdError || ssError);
        toast.error('Failed to load some analytics data');
      }
      
      // Process raw SQL results
      const studentsByProgram = studentsByProgramRaw ? studentsByProgramRaw
        .filter((item: any) => item.result && item.result.program_id)
        .map((item: any) => {
          const result = item.result;
          return {
            name: programMap.get(Number(result.program_id)) || `Program ${result.program_id}`,
            value: parseInt(result.count, 10) || 0
          };
        }) : [];
      
      const studentsByCenter = studentsByCenterRaw ? studentsByCenterRaw
        .filter((item: any) => item.result && item.result.center_id)
        .map((item: any) => {
          const result = item.result;
          return {
            name: centerMap.get(Number(result.center_id)) || `Center ${result.center_id}`,
            value: parseInt(result.count, 10) || 0
          };
        }) : [];
      
      const educatorsByCenter = educatorsByCenterRaw ? educatorsByCenterRaw
        .filter((item: any) => item.result && item.result.center_id)
        .map((item: any) => {
          const result = item.result;
          return {
            name: centerMap.get(Number(result.center_id)) || `Center ${result.center_id}`,
            value: parseInt(result.count, 10) || 0
          };
        }) : [];
      
      const studentsByDiagnosis = studentsByDiagnosisRaw ? studentsByDiagnosisRaw
        .filter((item: any) => item.result)
        .map((item: any) => {
          const result = item.result;
          return {
            name: result.primary_diagnosis || 'Unknown',
            value: parseInt(result.count, 10) || 0
          };
        }) : [];
        
      const studentsByStatus = studentsByStatusRaw ? studentsByStatusRaw
        .filter((item: any) => item.result)
        .map((item: any) => {
          const result = item.result;
          return {
            name: result.status || 'Unknown',
            value: parseInt(result.count, 10) || 0
          };
        }) : [];
      
      // Calculate teacher to student ratio for each center
      const teacherToStudentRatio = centers?.map(center => {
        const studentsCount = studentsByCenter.find(item => item.name === center.name)?.value || 0;
        const educatorsCount = educatorsByCenter.find(item => item.name === center.name)?.value || 0;
        
        return {
          name: center.name,
          ratio: educatorsCount > 0 ? Number((studentsCount / educatorsCount).toFixed(2)) : 0
        };
      }) || [];
      
      setData({
        studentsByProgram,
        studentsByCenter,
        educatorsByCenter,
        studentsByDiagnosis,
        teacherToStudentRatio,
        studentsByStatus
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
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
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Teacher to Student Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.teacherToStudentRatio}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomRatioTooltip />} />
                <Legend />
                <Bar dataKey="ratio" name="Students per Teacher" fill="#ff7300">
                  {data.teacherToStudentRatio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 7) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.studentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.studentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
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
          <span className="font-medium">{payload[0].value}</span> {payload[0].name === "Students" ? "students" : payload[0].name === "Educators" ? "educators" : ""}
        </p>
      </div>
    );
  }

  return null;
};

const CustomRatioTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-semibold">{label}</p>
        <p className="text-sm">
          <span className="font-medium">{payload[0].value}</span> students per teacher
        </p>
      </div>
    );
  }

  return null;
};

export default AnalyticsDashboard;
