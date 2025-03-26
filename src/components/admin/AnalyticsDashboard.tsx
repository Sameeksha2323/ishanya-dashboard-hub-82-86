
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Define chart color scheme
const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042', '#9b87f5', '#D946EF'];

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentsByProgram, setStudentsByProgram] = useState<any[]>([]);
  const [studentsByCenter, setStudentsByCenter] = useState<any[]>([]);
  const [studentsByDiagnosis, setStudentsByDiagnosis] = useState<any[]>([]);
  const [studentsByGender, setStudentsByGender] = useState<any[]>([]);
  const [studentsByStatus, setStudentsByStatus] = useState<any[]>([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [programNameMap, setProgramNameMap] = useState<{[key: string]: string}>({});
  const [centerNameMap, setCenterNameMap] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);

  // Animation variants for the charts
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch program names for mapping
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('program_id, name');
          
        if (programsError) throw programsError;
        
        if (programsData) {
          const programMap = programsData.reduce((acc: {[key: string]: string}, program) => {
            acc[program.program_id] = program.name;
            return acc;
          }, {});
          setProgramNameMap(programMap);
        }
        
        // Fetch center names for mapping
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('center_id, name');
          
        if (centersError) throw centersError;
        
        if (centersData) {
          const centerMap = centersData.reduce((acc: {[key: string]: string}, center) => {
            acc[center.center_id] = center.name;
            return acc;
          }, {});
          setCenterNameMap(centerMap);
        }

        // Fetch students grouped by program using the provided SQL query through RPC
        const { data: programData, error: programError } = await supabase.rpc('get_students_by_program');
        
        if (programError) {
          console.error('Error with RPC, falling back to standard query:', programError);
          
          // Fallback: use a standard query to get program data
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('students')
            .select('program_id, programs!inner(name)')
            .order('program_id');
            
          if (fallbackError) throw fallbackError;
          
          if (fallbackData) {
            // Process and count program data
            const programCounts: {[key: string]: number} = {};
            
            fallbackData.forEach(student => {
              // @ts-ignore - we know this structure exists
              const programName = student.programs?.name || 'Unknown';
              programCounts[programName] = (programCounts[programName] || 0) + 1;
            });
            
            const formattedProgramData = Object.entries(programCounts).map(([name, count]) => ({
              name,
              count
            }));
            
            setStudentsByProgram(formattedProgramData);
          }
        } else if (programData) {
          // Format the RPC data
          const formattedProgramData = programData.map((item: any) => ({
            name: item.name,
            count: Number(item.total_students)
          }));
          
          setStudentsByProgram(formattedProgramData);
        }

        // Fetch students grouped by center
        const { data: centerData, error: centerError } = await supabase
          .from('students')
          .select('center_id');
          
        if (centerError) throw centerError;
        
        if (centerData) {
          const centerCounts: {[key: string]: number} = {};
          
          centerData.forEach(student => {
            const centerId = student.center_id?.toString() || 'Unknown';
            centerCounts[centerId] = (centerCounts[centerId] || 0) + 1;
          });
          
          const formattedCenterData = Object.entries(centerCounts).map(([centerId, count]) => ({
            centerId,
            centerName: centerNameMap[centerId] || `Center ${centerId}`,
            count
          }));
          
          setStudentsByCenter(formattedCenterData);
        }

        // Fetch students grouped by diagnosis
        const { data: diagnosisData, error: diagnosisError } = await supabase
          .from('students')
          .select('primary_diagnosis');
          
        if (diagnosisError) throw diagnosisError;
        
        if (diagnosisData) {
          const diagnosisCounts: {[key: string]: number} = {};
          
          diagnosisData.forEach(student => {
            const diagnosis = student.primary_diagnosis || 'Unknown';
            diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
          });
          
          const formattedDiagnosisData = Object.entries(diagnosisCounts).map(([diagnosis, count]) => ({
            diagnosis,
            count
          }));
          
          setStudentsByDiagnosis(formattedDiagnosisData);
        }

        // Fetch students grouped by gender
        const { data: genderData, error: genderError } = await supabase
          .from('students')
          .select('gender');
          
        if (genderError) throw genderError;
        
        if (genderData) {
          const genderCounts: {[key: string]: number} = {};
          
          genderData.forEach(student => {
            const gender = student.gender || 'Unknown';
            genderCounts[gender] = (genderCounts[gender] || 0) + 1;
          });
          
          const formattedGenderData = Object.entries(genderCounts).map(([gender, count]) => ({
            gender,
            count
          }));
          
          setStudentsByGender(formattedGenderData);
        }

        // Fetch students grouped by status
        const { data: statusData, error: statusError } = await supabase
          .from('students')
          .select('status');
          
        if (statusError) throw statusError;
        
        if (statusData) {
          const statusCounts: {[key: string]: number} = {};
          
          statusData.forEach(student => {
            const status = student.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          const formattedStatusData = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count
          }));
          
          setStudentsByStatus(formattedStatusData);
        }

        // Fetch enrollment trends by year
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('students')
          .select('enrollment_year');
          
        if (enrollmentError) throw enrollmentError;
        
        if (enrollmentData) {
          const yearCounts: {[key: string]: number} = {};
          
          enrollmentData.forEach(student => {
            const year = student.enrollment_year ? student.enrollment_year.toString() : 'Unknown';
            yearCounts[year] = (yearCounts[year] || 0) + 1;
          });
          
          const formattedEnrollmentData = Object.entries(yearCounts)
            .filter(([year]) => year !== 'Unknown')
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([year, count]) => ({
              year,
              count
            }));
          
          setEnrollmentTrends(formattedEnrollmentData);
        }
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Error loading analytics: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students by Program - Now a Pie Chart */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Students by Program</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsByProgram}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {studentsByProgram.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                            <p className="font-semibold">{payload[0].payload.name}</p>
                            <p>Students: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Students by Center */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Students by Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentsByCenter}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="centerName" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Students" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Students by Diagnosis */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Students by Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsByDiagnosis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="diagnosis"
                      label={({ diagnosis, count }) => `${diagnosis}: ${count}`}
                    >
                      {studentsByDiagnosis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Students by Gender */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Students by Gender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsByGender}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="gender"
                      label={({ gender, count }) => `${gender}: ${count}`}
                    >
                      {studentsByGender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Students by Status */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Students by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {studentsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Enrollment Trends */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          className="w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Students Enrolled" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
