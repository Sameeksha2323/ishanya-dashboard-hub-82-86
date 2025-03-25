
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import axios from 'axios';

type Student = {
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  program_id: number;
  educator_employee_id: number;
  center_id: number;
};

type PerformanceRecord = {
  student_id: number;
  program_id: number;
  educator_employee_id: number;
  quarter: string;
  area_of_development: string;
  [key: string]: any;
};

type GeneralReport = {
  student_id: number;
  program_id: number;
  educator_employee_id: number;
  quarter: string;
  punctuality?: string;
  preparedness?: string;
  assistance_required?: string;
  parental_support?: string;
  any_behavioral_issues?: string;
};

type Task = {
  task_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  created_at: string;
  priority: string;
  category: string;
  feedback?: string;
};

type Attendance = {
  present: number;
  absent: number;
};

const QUARTERS = [
  "January 2025 - March 2025",
  "April 2025 - June 2025",
  "July 2025 - September 2025",
  "October 2025 - December 2025"
];

const YEARS = [2024, 2025, 2026];

const StudentDetails = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [generalReports, setGeneralReports] = useState<GeneralReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance>({ present: 0, absent: 0 });
  const [expandedQuarter, setExpandedQuarter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number>(2025);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        // Convert studentId to number for database queries
        const studentIdNum = parseInt(studentId, 10);
        
        // Fetch student info
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id, first_name, last_name, gender, program_id, educator_employee_id, center_id')
          .eq('student_id', studentIdNum)
          .single();

        if (studentError) throw studentError;
        setStudent(studentData);

        // Fetch performance records
        const { data: perfData, error: perfError } = await supabase
          .from('performance_records')
          .select('*')
          .eq('student_id', studentIdNum);

        if (perfError) throw perfError;
        setPerformanceRecords(perfData || []);

        // Fetch general reports
        const { data: reportData, error: reportError } = await supabase
          .from('general_reporting')
          .select('*')
          .eq('student_id', studentIdNum);

        if (reportError) throw reportError;
        setGeneralReports(reportData || []);

        // Fetch tasks
        const { data: taskData, error: taskError } = await supabase
          .from('goals_tasks')
          .select('*')
          .eq('student_id', studentIdNum);

        if (taskError) throw taskError;
        setTasks(taskData || []);

        // Fetch attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('student_attendance')
          .select('attendance')
          .eq('student_id', studentIdNum);

        if (attendanceError) throw attendanceError;
        
        // Calculate attendance statistics
        const present = attendanceData?.filter(a => a.attendance === true).length || 0;
        const absent = attendanceData?.filter(a => a.attendance === false).length || 0;
        setAttendance({ present, absent });

      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const getQuarterlyPerformance = (quarter: string) => {
    if (!student) return null;
    
    // Filter for the specific quarter and current year
    const yearPrefix = currentYear.toString();
    const fullQuarter = quarter.includes(yearPrefix) ? quarter : quarter.replace(/\d{4}/g, yearPrefix);
    
    return performanceRecords.find(record => 
      record.student_id === student.student_id &&
      record.program_id === student.program_id &&
      record.educator_employee_id === student.educator_employee_id &&
      record.quarter === fullQuarter
    );
  };

  const getQuarterlyReport = (quarter: string) => {
    if (!student) return null;
    
    // Filter for the specific quarter and current year
    const yearPrefix = currentYear.toString();
    const fullQuarter = quarter.includes(yearPrefix) ? quarter : quarter.replace(/\d{4}/g, yearPrefix);
    
    return generalReports.find(report => 
      report.student_id === student.student_id &&
      report.program_id === student.program_id &&
      report.educator_employee_id === student.educator_employee_id &&
      report.quarter === fullQuarter
    );
  };

  const handleDownloadReport = async (quarter: string) => {
    if (!student) return;
    
    setLoadingReport(true);
    const yearPrefix = currentYear.toString();
    const fullQuarter = quarter.includes(yearPrefix) ? quarter : quarter.replace(/\d{4}/g, yearPrefix);
    
    try {
      const response = await axios({
        method: 'post',
        url: 'https://fast-api-ubv8.onrender.com/generate_report',
        data: {
          student_id: student.student_id,
          program_id: student.program_id,
          educator_employee_id: student.educator_employee_id,
          quarter: fullQuarter
        },
        responseType: 'blob' // Important for file download
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.first_name}_${student.last_name}_${fullQuarter.replace(/\s/g, '_')}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading report:', error);
      
      if (error.response?.status === 404) {
        toast.error('No report data found for this student and quarter');
      } else {
        toast.error('Failed to download report');
      }
    } finally {
      setLoadingReport(false);
    }
  };

  const toggleQuarter = (quarter: string) => {
    if (expandedQuarter === quarter) {
      setExpandedQuarter(null);
    } else {
      setExpandedQuarter(quarter);
    }
  };

  const adjustYear = (increment: number) => {
    const newYear = currentYear + increment;
    if (YEARS.includes(newYear)) {
      setCurrentYear(newYear);
    }
  };

  if (loading) {
    return (
      <Layout
        title="Loading..."
        subtitle="Please wait while we fetch the student details"
        showBackButton
        onBack={() => window.history.back()}
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout
        title="Student Not Found"
        subtitle="The requested student could not be found"
        showBackButton
        onBack={() => window.history.back()}
      >
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No student found with ID: {studentId}</p>
        </div>
      </Layout>
    );
  }

  const updatedQuarters = QUARTERS.map(quarter => 
    quarter.replace(/\d{4}/g, currentYear.toString())
  );

  return (
    <Layout
      title={`${student.first_name} ${student.last_name}`}
      subtitle={`Student ID: ${student.student_id} | Program ID: ${student.program_id}`}
      showBackButton
      onBack={() => window.history.back()}
    >
      <div className="space-y-6">
        {/* Student Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-500">Student Information</h3>
                <p className="mt-1"><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                <p><strong>Student ID:</strong> {student.student_id}</p>
                <p><strong>Gender:</strong> {student.gender}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Program Information</h3>
                <p className="mt-1"><strong>Program ID:</strong> {student.program_id}</p>
                <p><strong>Educator ID:</strong> {student.educator_employee_id}</p>
                <p><strong>Center ID:</strong> {student.center_id}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Attendance Summary</h3>
                <p className="mt-1"><strong>Present:</strong> {attendance.present} days</p>
                <p><strong>Absent:</strong> {attendance.absent} days</p>
                <p><strong>Attendance Rate:</strong> {
                  attendance.present + attendance.absent > 0 
                    ? `${Math.round((attendance.present / (attendance.present + attendance.absent)) * 100)}%` 
                    : 'N/A'
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustYear(-1)}
            disabled={!YEARS.includes(currentYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">{currentYear}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustYear(1)}
            disabled={!YEARS.includes(currentYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quarterly Performance Cards */}
        <div className="grid grid-cols-1 gap-4">
          {updatedQuarters.map((quarter) => {
            const performance = getQuarterlyPerformance(quarter);
            const report = getQuarterlyReport(quarter);
            const isExpanded = expandedQuarter === quarter;

            return (
              <Card key={quarter} className={`border-l-4 ${isExpanded ? 'border-l-ishanya-green' : 'border-l-gray-200'}`}>
                <CardHeader 
                  className="flex flex-row items-center justify-between cursor-pointer"
                  onClick={() => toggleQuarter(quarter)}
                >
                  <CardTitle className="text-lg">{quarter}</CardTitle>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Performance Records */}
                      <div>
                        <h3 className="font-semibold mb-3">Performance Records</h3>
                        {performance ? (
                          <div className="space-y-3">
                            <p><strong>Area of Development:</strong> {performance.area_of_development}</p>
                            
                            {/* Dynamic fields from performance record */}
                            {Object.entries(performance).map(([key, value]) => {
                              // Skip standard fields and null values
                              if (['id', 'student_id', 'program_id', 'educator_employee_id', 'quarter', 'area_of_development'].includes(key) || value === null) {
                                return null;
                              }
                              
                              // Format key for display (e.g., "1_score" becomes "Score 1")
                              const displayKey = key.includes('_') 
                                ? `${key.split('_')[1].charAt(0).toUpperCase() + key.split('_')[1].slice(1)} ${key.split('_')[0]}` 
                                : key.charAt(0).toUpperCase() + key.slice(1);
                              
                              return (
                                <p key={key}><strong>{displayKey}:</strong> {value}</p>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500">No performance records available for this quarter.</p>
                        )}
                      </div>
                      
                      {/* General Report */}
                      <div>
                        <h3 className="font-semibold mb-3">General Report</h3>
                        {report ? (
                          <div className="space-y-3">
                            {report.punctuality && <p><strong>Punctuality:</strong> {report.punctuality}</p>}
                            {report.preparedness && <p><strong>Preparedness:</strong> {report.preparedness}</p>}
                            {report.assistance_required && <p><strong>Assistance Required:</strong> {report.assistance_required}</p>}
                            {report.parental_support && <p><strong>Parental Support:</strong> {report.parental_support}</p>}
                            {report.any_behavioral_issues && <p><strong>Behavioral Issues:</strong> {report.any_behavioral_issues}</p>}
                          </div>
                        ) : (
                          <p className="text-gray-500">No general report available for this quarter.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button 
                        onClick={() => handleDownloadReport(quarter)}
                        disabled={loadingReport || (!performance && !report)}
                        className="bg-ishanya-green hover:bg-ishanya-green/80 text-white"
                      >
                        {loadingReport ? <LoadingSpinner size="sm" /> : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Student's Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Tasks and Goals */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tasks and Goals</h2>
          {tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.task_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{task.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(task.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{task.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{task.feedback || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No tasks or goals assigned to this student.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDetails;
