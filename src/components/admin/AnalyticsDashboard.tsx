
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';

// Enhanced color palette for better visibility
const COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#3B82F6', '#14B8A6', '#F97316', '#EC4899', '#6366F1',
  '#06B6D4', '#22C55E', '#F43F5E', '#8B5CF6', '#0EA5E9'
];

interface AnalyticsData {
  studentsByProgram: { name: string; value: number }[];
  studentsByCenter: { name: string; value: number }[];
  educatorsByCenter: { name: string; value: number }[];
  studentsByDiagnosis: { name: string; value: number }[];
  teacherToStudentRatio: { name: string; ratio: number }[];
  studentsByStatus: { name: string; value: number }[];
  studentsByGender: { name: string; value: number }[];
  enrollmentTrends: { name: string; value: number }[];
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>({
    studentsByProgram: [],
    studentsByCenter: [],
    educatorsByCenter: [],
    studentsByDiagnosis: [],
    teacherToStudentRatio: [],
    studentsByStatus: [],
    studentsByGender: [],
    enrollmentTrends: []
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

      const { data: studentsByGenderRaw, error: sgError } = await supabase.rpc('run_sql', {
        query: 'SELECT gender, COUNT(*) FROM students GROUP BY gender'
      });

      const { data: enrollmentTrendsRaw, error: etError } = await supabase.rpc('run_sql', {
        query: 'SELECT enrollment_year, COUNT(*) FROM students GROUP BY enrollment_year ORDER BY enrollment_year'
      });
      
      if (spError || scError || ecError || sdError || ssError || sgError || etError) {
        console.error('Error fetching analytics data:', spError || scError || ecError || sdError || ssError || sgError || etError);
        toast.error('Failed to load some analytics data');
      }
      
      // Process raw SQL results with error handling and default values
      const studentsByProgram = processRawData(studentsByProgramRaw, 'program_id', programMap, 'Program');
      const studentsByCenter = processRawData(studentsByCenterRaw, 'center_id', centerMap, 'Center');
      const educatorsByCenter = processRawData(educatorsByCenterRaw, 'center_id', centerMap, 'Center');
      
      // Special processing for diagnosis data (handle null/empty values)
      const studentsByDiagnosis = studentsByDiagnosisRaw 
        ? studentsByDiagnosisRaw
          .filter((item: any) => item.result)
          .map((item: any) => {
            const result = item.result;
            const diagnosisName = result.primary_diagnosis 
              ? result.primary_diagnosis.trim() || 'Unspecified' 
              : 'Unspecified';
            return {
              name: diagnosisName,
              value: parseInt(result.count, 10) || 0
            };
          }) 
        : [];
        
      // Process status data
      const studentsByStatus = studentsByStatusRaw 
        ? studentsByStatusRaw
          .filter((item: any) => item.result)
          .map((item: any) => {
            const result = item.result;
            return {
              name: result.status || 'Unknown',
              value: parseInt(result.count, 10) || 0
            };
          }) 
        : [];

      // Process gender data
      const studentsByGender = studentsByGenderRaw 
        ? studentsByGenderRaw
          .filter((item: any) => item.result)
          .map((item: any) => {
            const result = item.result;
            return {
              name: result.gender || 'Unknown',
              value: parseInt(result.count, 10) || 0
            };
          }) 
        : [];

      // Process enrollment trends
      const enrollmentTrends = enrollmentTrendsRaw 
        ? enrollmentTrendsRaw
          .filter((item: any) => item.result)
          .map((item: any) => {
            const result = item.result;
            return {
              name: result.enrollment_year?.toString() || 'Unknown',
              value: parseInt(result.count, 10) || 0
            };
          }) 
        : [];
      
      // Calculate teacher to student ratio for each center with error handling
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
        studentsByStatus,
        studentsByGender,
        enrollmentTrends
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process raw data with error handling
  const processRawData = (rawData: any, idField: string, nameMap: Map<number, string>, defaultPrefix: string) => {
    if (!rawData) return [];
    
    return rawData
      .filter((item: any) => item.result && item.result[idField])
      .map((item: any) => {
        const result = item.result;
        const id = Number(result[idField]);
        return {
          name: nameMap.get(id) || `${defaultPrefix} ${id}`,
          value: parseInt(result.count, 10) || 0
        };
      });
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
            {data.studentsByProgram.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No program data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.studentsByCenter.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No center data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Educators by Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.educatorsByCenter.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No educator data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.studentsByDiagnosis.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No diagnosis data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Gender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.studentsByGender.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.studentsByGender}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.studentsByGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No gender data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Teacher to Student Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.teacherToStudentRatio.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No ratio data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Students by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.studentsByStatus.length > 0 ? (
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
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 9) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No status data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Enrollment Trends by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {data.enrollmentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.enrollmentTrends}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Students Enrolled" fill="#3B82F6">
                    {data.enrollmentTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 11) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No enrollment data available
              </div>
            )}
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
