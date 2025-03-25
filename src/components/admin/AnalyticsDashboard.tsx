
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
      
      // Fetch lookups for program and center names
      const { data: programs } = await supabase.from('programs').select('program_id, name');
      const { data: centers } = await supabase.from('centers').select('center_id, name');
      
      // Create lookup maps
      const programMap = new Map(programs?.map(p => [p.program_id, p.name]) || []);
      const centerMap = new Map(centers?.map(c => [c.center_id, c.name]) || []);
      
      // Fetch analytics data using direct SQL queries via the run_sql function
      const [
        studentsByProgramData,
        studentsByCenterData,
        educatorsByCenterData,
        studentsByDiagnosisData,
        studentsByStatusData,
        studentsByGenderData,
        enrollmentTrendsData
      ] = await Promise.all([
        fetchSQL('SELECT program_id, COUNT(*) FROM students GROUP BY program_id'),
        fetchSQL('SELECT center_id, COUNT(*) FROM students GROUP BY center_id'),
        fetchSQL('SELECT center_id, COUNT(*) FROM educators GROUP BY center_id'),
        fetchSQL('SELECT COALESCE(primary_diagnosis, \'Unknown\') as diagnosis, COUNT(*) FROM students GROUP BY diagnosis'),
        fetchSQL('SELECT COALESCE(status, \'Unknown\') as status, COUNT(*) FROM students GROUP BY status'),
        fetchSQL('SELECT COALESCE(gender, \'Unknown\') as gender, COUNT(*) FROM students GROUP BY gender'),
        fetchSQL('SELECT COALESCE(enrollment_year::text, \'Unknown\') as year, COUNT(*) FROM students GROUP BY year ORDER BY year')
      ]);
      
      // Process raw data with lookups
      const studentsByProgram = processRawData(studentsByProgramData, 'program_id', programMap, 'Program');
      const studentsByCenter = processRawData(studentsByCenterData, 'center_id', centerMap, 'Center');
      const educatorsByCenter = processRawData(educatorsByCenterData, 'center_id', centerMap, 'Center');
      
      // Process special case data
      const studentsByDiagnosis = processSpecialCaseData(studentsByDiagnosisData, 'diagnosis');
      const studentsByStatus = processSpecialCaseData(studentsByStatusData, 'status');
      const studentsByGender = processSpecialCaseData(studentsByGenderData, 'gender');
      const enrollmentTrends = processSpecialCaseData(enrollmentTrendsData, 'year');
      
      // Calculate teacher to student ratio
      const teacherToStudentRatio = calculateRatio(studentsByCenter, educatorsByCenter, centerMap);
      
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
  
  // Helper function to fetch SQL query results
  const fetchSQL = async (query: string) => {
    const { data, error } = await supabase.rpc('run_sql', { query });
    if (error) {
      console.error(`Error running SQL query: ${query}`, error);
      return [];
    }
    return data || [];
  };

  // Helper function to process raw data with lookups
  const processRawData = (rawData: any[], idField: string, nameMap: Map<number, string>, defaultPrefix: string) => {
    if (!rawData || !rawData.length) return [];
    
    return rawData
      .filter(item => item.result)
      .map(item => {
        const result = item.result;
        const id = Number(result[idField]);
        const name = nameMap.get(id) || `${defaultPrefix} ${id}`;
        const value = parseInt(result.count, 10) || 0;
        return { name, value };
      });
  };
  
  // Helper function to process special case data without lookups
  const processSpecialCaseData = (rawData: any[], nameField: string) => {
    if (!rawData || !rawData.length) return [];
    
    return rawData
      .filter(item => item.result)
      .map(item => {
        const result = item.result;
        const name = result[nameField] || 'Unknown';
        const value = parseInt(result.count, 10) || 0;
        return { name, value };
      });
  };
  
  // Helper function to calculate teacher to student ratio
  const calculateRatio = (
    studentsByCenter: {name: string; value: number}[], 
    educatorsByCenter: {name: string; value: number}[],
    centerMap: Map<number, string>
  ) => {
    // Create a result for each center in the map
    return Array.from(centerMap.entries()).map(([centerId, centerName]) => {
      const studentsCount = studentsByCenter.find(item => item.name === centerName)?.value || 0;
      const educatorsCount = educatorsByCenter.find(item => item.name === centerName)?.value || 0;
      
      return {
        name: centerName,
        ratio: educatorsCount > 0 ? Number((studentsCount / educatorsCount).toFixed(2)) : 0
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-lg text-blue-700">Students by Program</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
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
                      animationBegin={0}
                      animationDuration={1000}
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
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-lg text-green-700">Students by Center</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              {data.studentsByCenter.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.studentsByCenter}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Students" 
                      fill="#8884d8"
                      animationBegin={0}
                      animationDuration={1000}
                    >
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
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <CardTitle className="text-lg text-purple-700">Educators by Center</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              {data.educatorsByCenter.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.educatorsByCenter}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Educators" 
                      fill="#82ca9d"
                      animationBegin={0}
                      animationDuration={1000}
                    >
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
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg">
            <CardTitle className="text-lg text-yellow-700">Students by Diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
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
                      animationBegin={0}
                      animationDuration={1000}
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
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-lg">
            <CardTitle className="text-lg text-pink-700">Students by Gender</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
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
                      animationBegin={0}
                      animationDuration={1000}
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
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
            <CardTitle className="text-lg text-orange-700">Teacher to Student Ratio</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              {data.teacherToStudentRatio.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.teacherToStudentRatio}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomRatioTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="ratio" 
                      name="Students per Teacher" 
                      fill="#ff7300"
                      animationBegin={0}
                      animationDuration={1000}
                    >
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
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
            <CardTitle className="text-lg text-indigo-700">Students by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
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
                      animationBegin={0}
                      animationDuration={1000}
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
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-lg">
            <CardTitle className="text-lg text-teal-700">Enrollment Trends by Year</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              {data.enrollmentTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.enrollmentTrends}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Students Enrolled" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      animationBegin={0}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No enrollment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-md">
        <p className="font-semibold">{payload[0].name || label}</p>
        <p className="text-sm">
          <span className="font-medium">{payload[0].value}</span> {
            payload[0].name === "Students" ? "students" : 
            payload[0].name === "Educators" ? "educators" : 
            ""
          }
        </p>
      </div>
    );
  }

  return null;
};

const CustomRatioTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-md">
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
