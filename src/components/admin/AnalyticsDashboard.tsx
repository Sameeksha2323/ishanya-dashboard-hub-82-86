
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
      
      // We'll fetch data directly using the Supabase client instead of using the run_sql function
      
      // Students by Program
      const { data: studentsByProgramData, error: programError } = await supabase
        .from('students')
        .select('program_id, count')
        .select('program_id')
        .throwOnError();
      
      // Process and group the students by program
      const studentsByProgramCount = studentsByProgramData?.reduce((acc, student) => {
        const programId = student.program_id;
        acc[programId] = (acc[programId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};
      
      const studentsByProgram = Object.entries(studentsByProgramCount).map(([programId, count]) => ({
        name: programMap.get(Number(programId)) || `Program ${programId}`,
        value: count
      }));

      // Students by Center
      const { data: studentsByCenterData } = await supabase
        .from('students')
        .select('center_id');
      
      // Process and group the students by center
      const studentsByCenterCount = studentsByCenterData?.reduce((acc, student) => {
        const centerId = student.center_id;
        acc[centerId] = (acc[centerId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};
      
      const studentsByCenter = Object.entries(studentsByCenterCount).map(([centerId, count]) => ({
        name: centerMap.get(Number(centerId)) || `Center ${centerId}`,
        value: count
      }));

      // Educators by Center
      const { data: educatorsByCenterData } = await supabase
        .from('educators')
        .select('center_id');
      
      // Process and group the educators by center
      const educatorsByCenterCount = educatorsByCenterData?.reduce((acc, educator) => {
        const centerId = educator.center_id;
        acc[centerId] = (acc[centerId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};
      
      const educatorsByCenter = Object.entries(educatorsByCenterCount).map(([centerId, count]) => ({
        name: centerMap.get(Number(centerId)) || `Center ${centerId}`,
        value: count
      }));

      // Students by Diagnosis
      const { data: studentsByDiagnosisData } = await supabase
        .from('students')
        .select('primary_diagnosis');
      
      // Process and group the students by diagnosis
      const studentsByDiagnosisCount = studentsByDiagnosisData?.reduce((acc, student) => {
        const diagnosis = student.primary_diagnosis || 'Unknown';
        acc[diagnosis] = (acc[diagnosis] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const studentsByDiagnosis = Object.entries(studentsByDiagnosisCount).map(([diagnosis, count]) => ({
        name: diagnosis,
        value: count
      }));

      // Students by Status
      const { data: studentsByStatusData } = await supabase
        .from('students')
        .select('status');
      
      // Process and group the students by status
      const studentsByStatusCount = studentsByStatusData?.reduce((acc, student) => {
        const status = student.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const studentsByStatus = Object.entries(studentsByStatusCount).map(([status, count]) => ({
        name: status,
        value: count
      }));

      // Students by Gender
      const { data: studentsByGenderData } = await supabase
        .from('students')
        .select('gender');
      
      // Process and group the students by gender
      const studentsByGenderCount = studentsByGenderData?.reduce((acc, student) => {
        const gender = student.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const studentsByGender = Object.entries(studentsByGenderCount).map(([gender, count]) => ({
        name: gender,
        value: count
      }));

      // Enrollment Trends by Year
      const { data: enrollmentTrendsData } = await supabase
        .from('students')
        .select('enrollment_year');
      
      // Process and group the students by enrollment year
      const enrollmentTrendsCount = enrollmentTrendsData?.reduce((acc, student) => {
        const year = student.enrollment_year?.toString() || 'Unknown';
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const enrollmentTrends = Object.entries(enrollmentTrendsCount)
        .map(([year, count]) => ({
          name: year,
          value: count
        }))
        .sort((a, b) => (a.name === 'Unknown' ? 1 : b.name === 'Unknown' ? -1 : a.name.localeCompare(b.name)));

      // Calculate Teacher to Student Ratio
      const teacherToStudentRatio = Array.from(centerMap.entries()).map(([centerId, centerName]) => {
        const studentsCount = studentsByCenterCount[centerId] || 0;
        const educatorsCount = educatorsByCenterCount[centerId] || 0;
        
        return {
          name: centerName,
          ratio: educatorsCount > 0 ? Number((studentsCount / educatorsCount).toFixed(2)) : 0
        };
      });
      
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
