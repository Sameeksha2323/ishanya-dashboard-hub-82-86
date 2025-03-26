import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';
import { ArrowDown, Download, Send, Calendar, User, Clock, MapPin, FileText, Heart, AlertTriangle, FileBarChart } from 'lucide-react';

interface StudentData {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  photo?: string;
  gender?: string;
  dob?: string;
  primary_diagnosis?: string;
  comorbidity?: string;
  enrollment_year?: string;
  status?: string;
  student_email?: string;
  program_id?: number;
  programs?: { name: string };
  number_of_sessions?: number;
  timings?: string[] | string;
  days_of_week?: string[] | string;
  session_type?: string;
  fathers_name?: string;
  mothers_name?: string;
  blood_group?: string;
  allergies?: string;
  contact_number?: string;
  alt_contact_number?: string;
  address?: string;
  transport?: string;
  strengths?: string;
  weakness?: string;
  comments?: string;
  educator_employee_id?: string;
}

interface EducatorData {
  id: string;
  employee_id: string;
  name: string;
  photo?: string;
  email?: string;
  phone?: string;
  designation?: string;
}

const ParentDetailsPage = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [educatorData, setEducatorData] = useState<EducatorData | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    let isMounted = true;
    
    const fetchData = async () => {
      if (!user || !user.email) {
        if (isMounted) {
          setError("Not logged in");
          setLoading(false);
        }
        return;
      }
      
      try {
        if (!isMounted) return;
        setLoading(true);
        
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('student_id, feedback')
          .eq('email', user.email)
          .single();
          
        if (parentError) {
          console.error('Error fetching parent data:', parentError);
          if (isMounted) {
            setError("Unable to fetch parent information. Please contact support.");
            setLoading(false);
          }
          return;
        }
        
        if (!parentData || !parentData.student_id) {
          if (isMounted) {
            setError("No student linked to this parent account. Please contact the administrator.");
            setLoading(false);
          }
          return;
        }

        if (parentData.feedback && isMounted) {
          setFeedback(parentData.feedback);
        }
        
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*, programs(name)')
          .eq('student_id', parentData.student_id)
          .single();
          
        if (studentError) {
          console.error('Error fetching student data:', studentError);
          if (isMounted) {
            setError("Unable to fetch student information. Please contact support.");
            setLoading(false);
          }
          return;
        }
        
        if (!student) {
          if (isMounted) {
            setError("No student record found for the linked student ID. Please contact the administrator.");
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setStudentData(student);
        }
        
        if (student.educator_employee_id) {
          const { data: educator, error: educatorError } = await supabase
            .from('educators')
            .select('*')
            .eq('employee_id', student.educator_employee_id)
            .single();
            
          if (educatorError) {
            console.error('Error fetching educator data:', educatorError);
          } else if (educator && isMounted) {
            setEducatorData(educator);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          setError("An unexpected error occurred. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    navigate('/parent');
  };

  const handleFeedbackSubmit = async () => {
    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to submit feedback.",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('parents')
        .update({ feedback })
        .eq('email', user.email);
        
      if (error) {
        console.error('Error submitting feedback:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to submit feedback. Please try again later.",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Your feedback has been submitted.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your report...",
    });
    
    try {
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `student-report-${timestamp}.pdf`;
      
      pdf.save(fileName);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again later.",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatArray = (arr?: string[] | string) => {
    if (!arr) return 'N/A';
    if (typeof arr === 'string') {
      try {
        const parsed = JSON.parse(arr);
        return Array.isArray(parsed) ? parsed.join(', ') : arr;
      } catch {
        return arr;
      }
    }
    return Array.isArray(arr) ? arr.join(', ') : 'N/A';
  };

  const progressData = [
    { date: '2023-12-01', activity: 'Reading Session', progress: 'Good', notes: 'Completed 3 pages' },
    { date: '2023-12-05', activity: 'Math Exercise', progress: 'Excellent', notes: 'Mastered addition' },
    { date: '2023-12-10', activity: 'Speech Therapy', progress: 'Improving', notes: 'Pronounced 5 new words' },
    { date: '2023-12-15', activity: 'Physical Activity', progress: 'Good', notes: 'Participated enthusiastically' },
  ];

  return (
    <Layout
      title="Student Details"
      subtitle="View comprehensive information about your child"
      showBackButton
      onBack={handleBack}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : studentData ? (
        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={generatePDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="education">Education Details</TabsTrigger>
              <TabsTrigger value="health">Health & Development</TabsTrigger>
              <TabsTrigger value="progress">Progress & Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Student Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-2">
                    <div className="mb-4">
                      {studentData.photo ? (
                        <img 
                          src={studentData.photo} 
                          alt={`${studentData.first_name} ${studentData.last_name}`}
                          className="w-32 h-32 rounded-full object-cover mx-auto"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{studentData.first_name} {studentData.last_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        studentData.status?.toLowerCase() === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {studentData.status || 'Status unknown'}
                      </span>
                    </p>
                    <div className="mt-4 text-left">
                      <p className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Student ID:</span>
                        <span className="font-medium">{studentData.student_id}</span>
                      </p>
                      <p className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Gender:</span>
                        <span className="font-medium">{studentData.gender || 'N/A'}</span>
                      </p>
                      <p className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Date of Birth:</span>
                        <span className="font-medium">{formatDate(studentData.dob)}</span>
                      </p>
                      <p className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Enrollment Year:</span>
                        <span className="font-medium">{studentData.enrollment_year || 'N/A'}</span>
                      </p>
                      <p className="flex justify-between py-2">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium text-blue-600">{studentData.student_email || 'N/A'}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Family Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">Parent Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-sm">Father's Name</p>
                          <p className="font-medium">{studentData.fathers_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Mother's Name</p>
                          <p className="font-medium">{studentData.mothers_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Primary Contact</p>
                          <p className="font-medium">{studentData.contact_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Alternative Contact</p>
                          <p className="font-medium">{studentData.alt_contact_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">Address & Transport</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-sm">Home Address</p>
                          <p className="font-medium">{studentData.address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Transport Details</p>
                          <p className="font-medium">{studentData.transport || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Program & Session Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Program Details
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-gray-500 text-sm">Assigned Program</p>
                        <p className="font-medium">{studentData.programs?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Number of Sessions</p>
                        <p className="font-medium">{studentData.number_of_sessions || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Session Type</p>
                        <p className="font-medium">{studentData.session_type || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      Schedule Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-gray-500 text-sm">Scheduled Days</p>
                        <p className="font-medium">{formatArray(studentData.days_of_week)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Session Timings</p>
                        <p className="font-medium">{formatArray(studentData.timings)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Assigned Educator</p>
                        <p className="font-medium">{educatorData?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {educatorData && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Educator Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        {educatorData.photo ? (
                          <img 
                            src={educatorData.photo} 
                            alt={educatorData.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-10 w-10 text-blue-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-semibold text-lg">{educatorData.name}</h4>
                        <p className="text-gray-500 text-sm">{educatorData.designation || 'Educator'}</p>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {educatorData.email && (
                            <div>
                              <p className="text-gray-500 text-sm">Email</p>
                              <p className="font-medium text-blue-600">{educatorData.email}</p>
                            </div>
                          )}
                          
                          {educatorData.phone && (
                            <div>
                              <p className="text-gray-500 text-sm">Phone</p>
                              <p className="font-medium">{educatorData.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">Primary Diagnosis</h4>
                      <p className="bg-gray-50 p-3 rounded">{studentData.primary_diagnosis || 'No information available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">Comorbidities</h4>
                      <p className="bg-gray-50 p-3 rounded">{studentData.comorbidity || 'None reported'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-gray-700">Blood Group</h4>
                        <p className="bg-gray-50 p-3 rounded">{studentData.blood_group || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-gray-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                          Allergies
                        </h4>
                        <p className="bg-amber-50 p-3 rounded text-amber-800">{studentData.allergies || 'None reported'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Development Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-green-500" />
                        Strengths
                      </h4>
                      <p className="bg-green-50 p-3 rounded">{studentData.strengths || 'No information available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">Areas for Improvement</h4>
                      <p className="bg-gray-50 p-3 rounded">{studentData.weakness || 'No information available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">Additional Comments</h4>
                      <p className="bg-gray-50 p-3 rounded">{studentData.comments || 'No additional comments'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileBarChart className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Activity</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Progress</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {progressData.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-3 text-sm">{formatDate(item.date)}</td>
                            <td className="px-4 py-3 text-sm">{item.activity}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.progress === 'Excellent' ? 'bg-green-100 text-green-800' :
                                item.progress === 'Good' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.progress}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback & Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Share your thoughts, concerns, or feedback about your child's progress or educational needs.
                      This information will be reviewed by our staff.
                    </p>
                    
                    <Textarea
                      placeholder="Enter your feedback here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                  <Button 
                    onClick={handleFeedbackSubmit} 
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Feedback
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="hidden">
            <div ref={reportRef} className="p-8 bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Student Progress Report</h1>
                <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 pb-2 border-b">Student Information</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-semibold">{studentData.first_name} {studentData.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Student ID:</p>
                    <p className="font-semibold">{studentData.student_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date of Birth:</p>
                    <p className="font-semibold">{formatDate(studentData.dob)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Enrollment Year:</p>
                    <p className="font-semibold">{studentData.enrollment_year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Program:</p>
                    <p className="font-semibold">{studentData.programs?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-semibold">{studentData.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 pb-2 border-b">Medical Information</h2>
                <div className="mb-4">
                  <p className="text-gray-600">Primary Diagnosis:</p>
                  <p className="font-semibold">{studentData.primary_diagnosis || 'N/A'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600">Comorbidities:</p>
                  <p className="font-semibold">{studentData.comorbidity || 'None reported'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Blood Group:</p>
                    <p className="font-semibold">{studentData.blood_group || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Allergies:</p>
                    <p className="font-semibold">{studentData.allergies || 'None reported'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 pb-2 border-b">Development Profile</h2>
                <div className="mb-4">
                  <p className="text-gray-600">Strengths:</p>
                  <p className="font-semibold">{studentData.strengths || 'No information available'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600">Areas for Improvement:</p>
                  <p className="font-semibold">{studentData.weakness || 'No information available'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Additional Comments:</p>
                  <p className="font-semibold">{studentData.comments || 'No additional comments'}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3 pb-2 border-b">Recent Progress</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Date</th>
                      <th className="border p-2 text-left">Activity</th>
                      <th className="border p-2 text-left">Progress</th>
                      <th className="border p-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{formatDate(item.date)}</td>
                        <td className="border p-2">{item.activity}</td>
                        <td className="border p-2">{item.progress}</td>
                        <td className="border p-2">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <p className="text-center text-gray-500 text-sm">
                  This report is generated for informational purposes only. For detailed assessment, please consult with the assigned educator.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ErrorDisplay message="Unable to load student information. Please try again later." />
      )}
    </Layout>
  );
};

export default ParentDetailsPage;

