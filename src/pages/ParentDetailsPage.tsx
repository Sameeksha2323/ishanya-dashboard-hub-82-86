
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Book,
  Calendar,
  Clock,
  MessageSquare,
  ChevronRight,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReportUploader from '@/components/parent/ReportUploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StudentData = {
  student_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  status: string;
  center_id: number;
  program_id: number;
  contact_number: string;
  alt_contact_number: string;
  address: string;
  photo: string;
  primary_diagnosis: string;
  comorbidity: string;
  educator_employee_id: number;
  [key: string]: any;
};

type EducatorData = {
  employee_id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  photo: string;
  [key: string]: any;
};

type ProgramData = {
  program_id: number;
  name: string;
  center_id: number;
  [key: string]: any;
};

type CenterData = {
  center_id: number;
  name: string;
  [key: string]: any;
};

const ParentDetailsPage = () => {
  const location = useLocation();
  const initialTab = location.state?.activeTab || 'student-info';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [educator, setEducator] = useState<EducatorData | null>(null);
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [center, setCenter] = useState<CenterData | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [showReportUploader, setShowReportUploader] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const user = getCurrentUser();
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const fetchParentData = async () => {
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get parent record
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
          .eq('email', user.email);
          
        if (parentError) {
          console.error('Error fetching parent data:', parentError);
          setError("Failed to fetch parent data");
          setLoading(false);
          return;
        }
        
        if (!parentData || parentData.length === 0) {
          setError("No parent record found");
          setLoading(false);
          return;
        }
        
        // Get all student IDs associated with this parent
        const studentIds = parentData.map(p => p.student_id).filter(Boolean);
        setStudents(studentIds);
        
        if (studentIds.length === 0) {
          setError("No students associated with this parent");
          setLoading(false);
          return;
        }
        
        const firstStudentId = studentIds[0];
        setStudentId(firstStudentId);
        setSelectedStudentId(firstStudentId);
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*, programs(*)')
          .eq('student_id', firstStudentId)
          .single();
          
        if (studentError) {
          console.error('Error fetching student data:', studentError);
          setError("Failed to fetch student data");
          setLoading(false);
          return;
        }
        
        setStudent(studentData);
        
        // Fetch educator
        if (studentData.educator_employee_id) {
          const { data: educatorData, error: educatorError } = await supabase
            .from('educators')
            .select('*')
            .eq('employee_id', studentData.educator_employee_id)
            .single();
            
          if (!educatorError && educatorData) {
            setEducator(educatorData);
          }
        }
        
        // Fetch program
        if (studentData.program_id) {
          const { data: programData, error: programError } = await supabase
            .from('programs')
            .select('*')
            .eq('program_id', studentData.program_id)
            .single();
            
          if (!programError && programData) {
            setProgram(programData);
            
            // Fetch center
            if (programData.center_id) {
              const { data: centerData, error: centerError } = await supabase
                .from('centers')
                .select('*')
                .eq('center_id', programData.center_id)
                .single();
                
              if (!centerError && centerData) {
                setCenter(centerData);
              }
            }
          }
        }
        
        // Fetch reports
        fetchReports(firstStudentId);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };
    
    fetchParentData();
    
    return () => {
      initialized.current = false;
    };
  }, [user]);
  
  const fetchReports = async (id: number) => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .storage
        .from('ishanya')
        .list(`student-reports/${id}`);
        
      if (reportError) {
        console.error('Error fetching reports:', reportError);
        return;
      }
      
      setReports(reportData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() || !educator) return;
    
    try {
      // In a real app, you would send this message to the backend
      // For now, just simulate it
      const newMessage = {
        id: Date.now(),
        sender: 'parent',
        message,
        timestamp: new Date().toISOString(),
      };
      
      setConversations(prev => [...prev, newMessage]);
      setMessage('');
      setShowMessageDialog(false);
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the educator",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleReportUploadSuccess = () => {
    setShowReportUploader(false);
    if (studentId) {
      fetchReports(studentId);
    }
  };
  
  const handleViewReport = async (fileName: string) => {
    if (!studentId) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('ishanya')
        .createSignedUrl(`student-reports/${studentId}/${fileName}`, 60);
        
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate URL for the report",
        });
        return;
      }
      
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while trying to view the report",
      });
    }
  };
  
  const handleStudentChange = async (id: string) => {
    const studentId = parseInt(id, 10);
    setSelectedStudentId(studentId);
    
    try {
      setLoading(true);
      
      // Fetch student details
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*, programs(*)')
        .eq('student_id', studentId)
        .single();
        
      if (studentError) {
        console.error('Error fetching student data:', studentError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch student data",
        });
        setLoading(false);
        return;
      }
      
      setStudent(studentData);
      
      // Fetch educator
      if (studentData.educator_employee_id) {
        const { data: educatorData, error: educatorError } = await supabase
          .from('educators')
          .select('*')
          .eq('employee_id', studentData.educator_employee_id)
          .single();
          
        if (!educatorError && educatorData) {
          setEducator(educatorData);
        }
      }
      
      // Fetch program
      if (studentData.program_id) {
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('*')
          .eq('program_id', studentData.program_id)
          .single();
          
        if (!programError && programData) {
          setProgram(programData);
          
          // Fetch center
          if (programData.center_id) {
            const { data: centerData, error: centerError } = await supabase
              .from('centers')
              .select('*')
              .eq('center_id', programData.center_id)
              .single();
              
            if (!centerError && centerData) {
              setCenter(centerData);
            }
          }
        }
      }
      
      // Fetch reports
      fetchReports(studentId);
      
      setStudentId(studentId);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout
        title="Loading..."
        subtitle="Please wait while we fetch your information"
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout
        title="Error"
        subtitle="We encountered an error"
      >
        <ErrorDisplay message={error} />
      </Layout>
    );
  }
  
  if (!student) {
    return (
      <Layout
        title="No Data Found"
        subtitle="We couldn't find any student information"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">Please contact the administrator for assistance.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title={`${student.first_name} ${student.last_name}'s Information`}
      subtitle="View your child's details and progress"
    >
      <div className="mb-6">
        {students.length > 1 && (
          <div className="mb-6">
            <Select 
              value={selectedStudentId?.toString()} 
              onValueChange={handleStudentChange}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(id => (
                  <SelectItem 
                    key={id} 
                    value={id.toString()}
                  >
                    {student.student_id.toString() === id.toString() ? 
                      `${student.first_name} ${student.last_name}` : 
                      `Student ID: ${id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="student-info">
              <User className="h-4 w-4 mr-2" />
              Student Info
            </TabsTrigger>
            <TabsTrigger value="progress">
              <Book className="h-4 w-4 mr-2" />
              Progress & Reports
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="h-4 w-4 mr-2" />
              Communication
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="student-info">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Student Profile</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    {student.photo ? (
                      <AvatarImage src={student.photo} alt={`${student.first_name} ${student.last_name}`} />
                    ) : (
                      <AvatarFallback className="text-4xl bg-ishanya-green text-white">
                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <h3 className="text-xl font-bold">{student.first_name} {student.last_name}</h3>
                  <p className="text-gray-500 mb-4">ID: {student.student_id}</p>
                  
                  <div className="w-full">
                    <div className="py-2 border-b">
                      <span className="font-medium">Date of Birth:</span>
                      <span className="float-right text-gray-600">
                        {new Date(student.dob).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="py-2 border-b">
                      <span className="font-medium">Gender:</span>
                      <span className="float-right text-gray-600">{student.gender}</span>
                    </div>
                    
                    <div className="py-2 border-b">
                      <span className="font-medium">Status:</span>
                      <span className={`float-right ${
                        student.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                    
                    <div className="py-2 border-b">
                      <span className="font-medium">Enrollment Year:</span>
                      <span className="float-right text-gray-600">{student.enrollment_year}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-500 mb-2">Medical Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Primary Diagnosis</p>
                          <p className="text-gray-700">{student.primary_diagnosis || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Comorbidity</p>
                          <p className="text-gray-700">{student.comorbidity || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Blood Group</p>
                          <p className="text-gray-700">{student.blood_group || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Allergies</p>
                          <p className="text-gray-700">{student.allergies || 'None'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">UDID</p>
                          <p className="text-gray-700">{student.udid || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-500 mb-2">Contact Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Father's Name</p>
                          <p className="text-gray-700">{student.fathers_name || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Mother's Name</p>
                          <p className="text-gray-700">{student.mothers_name || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Contact Number</p>
                          <p className="text-gray-700">{student.contact_number || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Alternate Contact</p>
                          <p className="text-gray-700">{student.alt_contact_number || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-gray-700">{student.student_email || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-500 mb-2">Address</h3>
                    <p className="text-gray-700">{student.address || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Program</p>
                      <p className="text-gray-700">{program?.name || 'Not assigned'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Center</p>
                      <p className="text-gray-700">{center?.name || 'Not assigned'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Session Timings</p>
                      <p className="text-gray-700">{student.timings || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Days of Week</p>
                      <p className="text-gray-700">
                        {student.days_of_week && student.days_of_week.length > 0
                          ? student.days_of_week.join(', ')
                          : 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Session Type</p>
                      <p className="text-gray-700">{student.session_type || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Transport</p>
                      <p className="text-gray-700">{student.transport || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Educator Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {educator ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <Avatar className="h-16 w-16">
                        {educator.photo ? (
                          <AvatarImage src={educator.photo} alt={educator.name} />
                        ) : (
                          <AvatarFallback className="text-xl bg-ishanya-yellow text-white">
                            {educator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg">{educator.name}</h3>
                        <p className="text-gray-500">{educator.designation}</p>
                        <p className="text-gray-700">{educator.email}</p>
                        <p className="text-gray-700">{educator.phone}</p>
                      </div>
                      
                      <Button 
                        className="ml-auto mt-2 md:mt-0"
                        onClick={() => setShowMessageDialog(true)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Educator
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No educator assigned</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="progress">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Student Reports</CardTitle>
                  <Button 
                    onClick={() => setShowReportUploader(true)} 
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Report
                  </Button>
                </CardHeader>
                <CardContent>
                  {showReportUploader ? (
                    <ReportUploader 
                      onSuccess={handleReportUploadSuccess} 
                      onCancel={() => setShowReportUploader(false)}
                      studentId={studentId || undefined}
                    />
                  ) : (
                    <div>
                      {reports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Upload className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p>No reports have been uploaded yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setShowReportUploader(true)}
                          >
                            Upload Your First Report
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {reports.map((report, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="font-medium">{report.name.replace(/^\d+-/, '')}</p>
                                  <p className="text-xs text-gray-500">
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    {new Date(report.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewReport(report.name)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Progress Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500">
                    <Book className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>Progress assessments will be provided by your educator</p>
                    <p className="text-sm mt-1">
                      Check back later or contact your educator for more information
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="communication">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Educator</CardTitle>
                </CardHeader>
                <CardContent>
                  {educator ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                      <Avatar className="h-16 w-16">
                        {educator.photo ? (
                          <AvatarImage src={educator.photo} alt={educator.name} />
                        ) : (
                          <AvatarFallback className="text-xl bg-ishanya-yellow text-white">
                            {educator.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg">{educator.name}</h3>
                        <p className="text-gray-500">{educator.designation}</p>
                        <p className="text-gray-700">{educator.email}</p>
                        <p className="text-gray-700">{educator.phone}</p>
                      </div>
                      
                      <Button 
                        className="ml-auto mt-2 md:mt-0"
                        onClick={() => setShowMessageDialog(true)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No educator assigned</p>
                  )}
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-3">Messages</h3>
                    {conversations.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">
                          Start a conversation with your child's educator
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversations.map((msg) => (
                          <div 
                            key={msg.id}
                            className={`p-3 rounded-lg ${
                              msg.sender === 'parent' 
                                ? 'bg-blue-50 ml-10' 
                                : 'bg-gray-50 mr-10'
                            }`}
                          >
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">
                                {msg.sender === 'parent' ? 'You' : 'Educator'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <p className="mt-1">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Center Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  {center ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{center.name}</p>
                        <p className="text-gray-700">{center.location || 'Location not specified'}</p>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm text-gray-500">
                          For general inquiries or emergencies, please contact the center directly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Center information not available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Educator</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {educator?.photo ? (
                  <AvatarImage src={educator.photo} alt={educator?.name} />
                ) : (
                  <AvatarFallback className="bg-ishanya-yellow text-white">
                    {educator?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">{educator?.name}</p>
                <p className="text-sm text-gray-500">{educator?.designation}</p>
              </div>
            </div>
            
            <div>
              <textarea
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ParentDetailsPage;
