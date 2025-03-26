import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';
import DiscussionRoom from '@/components/discussion/DiscussionRoom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AttendanceTracker from '@/components/teacher/AttendanceTracker';
import TeacherReport from '@/components/teacher/TeacherReport';
import StudentDetails from '@/components/teacher/StudentDetails';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Eye, Kanban } from 'lucide-react';

const TeacherDashboard = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'attendance' | 'report' | 'discussion'>('programs');
  const [viewingStudentId, setViewingStudentId] = useState<number | null>(null);
  const user = getCurrentUser();
  const { toast } = useToast();
  const dataFetched = useRef(false);

  useEffect(() => {
    if (dataFetched.current || !user) return;
    
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        dataFetched.current = true;
        
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('employee_id')
          .eq('email', user.email)
          .single();
          
        if (employeeError) {
          console.error('Error fetching employee data:', employeeError);
          toast({
            title: "Error",
            description: "Could not fetch your employee information.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        const teacherEmployeeId = employeeData?.employee_id;
        console.log('Teacher Employee ID:', teacherEmployeeId);
        
        const { data: teacherPrograms, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .eq('center_id', user.center_id);
          
        if (programsError) {
          console.error('Error fetching teacher programs:', programsError);
          setLoading(false);
          return;
        }
        
        if (teacherPrograms && teacherPrograms.length > 0) {
          setPrograms(teacherPrograms);
          
          const firstProgramId = teacherPrograms[0].program_id;
          setSelectedProgram(firstProgramId);
          
          const { data: assignedStudents, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .or(`educator_employee_id.eq.${teacherEmployeeId},secondary_educator_employee_id.eq.${teacherEmployeeId}`)
            .eq('center_id', user.center_id);
            
          if (studentsError) {
            console.error('Error fetching students:', studentsError);
          } else {
            console.log('Assigned students:', assignedStudents);
            setStudents(assignedStudents || []);
          }
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [user, toast]);

  const handleProgramChange = async (programId: number) => {
    setSelectedProgram(programId);
    setLoading(true);
    
    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('email', user?.email)
        .single();
      
      const teacherEmployeeId = employeeData?.employee_id;
      
      const { data: programStudents, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('program_id', programId)
        .or(`educator_employee_id.eq.${teacherEmployeeId},secondary_educator_employee_id.eq.${teacherEmployeeId}`)
        .eq('center_id', user?.center_id);
        
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      } else {
        setStudents(programStudents || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentDetails = (studentId: number) => {
    setViewingStudentId(studentId);
  };

  const handleBackFromStudentDetails = () => {
    setViewingStudentId(null);
  };

  const openKanbanBoard = () => {
    if (user?.employee_id) {
      window.open(`https://goalwize.vercel.app/kanban/${user.employee_id}`, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Error",
        description: "Could not retrieve your employee ID.",
        variant: "destructive"
      });
    }
  };

  if (viewingStudentId !== null) {
    return (
      <Layout
        title="Student Details"
        subtitle="Detailed information about the student"
        showBackButton={true}
        onBack={handleBackFromStudentDetails}
      >
        <StudentDetails 
          studentId={viewingStudentId}
          onBack={handleBackFromStudentDetails}
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Teacher Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Teacher'}`}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="programs" onValueChange={(value) => setActiveTab(value as 'programs' | 'attendance' | 'report' | 'discussion')}>
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger value="programs" className="flex-1 sm:flex-none">My Programs</TabsTrigger>
              <TabsTrigger value="attendance" className="flex-1 sm:flex-none">Attendance</TabsTrigger>
              <TabsTrigger value="report" className="flex-1 sm:flex-none">My Report</TabsTrigger>
              <TabsTrigger value="discussion" className="flex-1 sm:flex-none">Discussion Room</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={openKanbanBoard}
            className="gap-2"
          >
            <Kanban className="h-5 w-5" />
            Kanban Board
          </Button>
        </div>
          
        <TabsContent value="programs" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>My Programs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {programs.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Programs</AlertTitle>
                        <AlertDescription>
                          You don't have any programs assigned to you yet.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Tabs 
                        defaultValue={selectedProgram?.toString()} 
                        onValueChange={(value) => handleProgramChange(parseInt(value))}
                      >
                        <TabsList className="mb-4 overflow-x-auto flex whitespace-nowrap w-full">
                          {programs.map((program) => (
                            <TabsTrigger key={program.program_id} value={program.program_id.toString()}>
                              {program.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {programs.map((program) => (
                          <TabsContent key={program.program_id} value={program.program_id.toString()}>
                            <Card>
                              <CardHeader>
                                <CardTitle>
                                  {program.name} - My Students ({students.length})
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {students.length === 0 ? (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>No Students</AlertTitle>
                                    <AlertDescription>
                                      You don't have any students assigned to you in this program.
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>ID</TableHead>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Sessions</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {students.map((student) => (
                                          <TableRow key={student.id}>
                                            <TableCell>{student.student_id}</TableCell>
                                            <TableCell>
                                              {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell>
                                              <span 
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  student.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                              >
                                                {student.status || 'N/A'}
                                              </span>
                                            </TableCell>
                                            <TableCell>{student.number_of_sessions || 'N/A'}</TableCell>
                                            <TableCell>
                                              <div className="flex gap-2">
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => handleViewStudentDetails(student.student_id)}
                                                >
                                                  <Eye className="h-4 w-4 mr-1" />
                                                  View Details
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              <AnnouncementBoard />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTracker students={students} />
        </TabsContent>
        
        <TabsContent value="report" className="mt-6">
          <TeacherReport />
        </TabsContent>
        
        <TabsContent value="discussion" className="mt-6">
          <DiscussionRoom />
        </TabsContent>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
