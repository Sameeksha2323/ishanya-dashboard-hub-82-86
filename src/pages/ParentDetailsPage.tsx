import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { Clock, FileText, Upload, Download, User, GraduationCap, Heart, Phone, Calendar, FileIcon, MessageSquare, Send } from 'lucide-react';
import ReportUploader from '@/components/parent/ReportUploader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import axios from 'axios';

const ParentDetailsPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('personal-info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [parentData, setParentData] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const user = getCurrentUser();
  
  useEffect(() => {
    // Get the active tab from location state
    const stateActiveTab = location.state?.activeTab;
    if (stateActiveTab) {
      setActiveTab(stateActiveTab);
    }
    
    fetchParentAndStudentData();
  }, [location]);
  
  const fetchParentAndStudentData = async () => {
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get parent data
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('email', user.email);
        
      if (parentError) {
        console.error('Error fetching parent data:', parentError);
        setError("Unable to fetch parent information. Please contact support.");
        setLoading(false);
        return;
      }
      
      if (!parentData || parentData.length === 0) {
        setError("No parent record found. Please contact the administrator.");
        setLoading(false);
        return;
      }
      
      setParentData(parentData[0]);
      
      // Get student IDs associated with this parent
      const studentIds = parentData.map((p: any) => p.student_id).filter(Boolean);
      
      if (studentIds.length > 0) {
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .in('student_id', studentIds);
          
        if (studentError) {
          console.error('Error fetching student data:', studentError);
          setError("Unable to fetch student information. Please contact support.");
          setLoading(false);
          return;
        }
        
        if (!studentData || studentData.length === 0) {
          setError("No student records found. Please contact the administrator.");
          setLoading(false);
          return;
        }
        
        setStudents(studentData);
        setSelectedStudentId(studentData[0].student_id);
        
        // Fetch reports for the first student
        await fetchReportsForStudent(studentData[0].student_id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parent and student data:', error);
      setError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  };
  
  const fetchReportsForStudent = async (studentId: number) => {
    if (!studentId) return;
    
    try {
      setLoadingReports(true);
      
      // Get reports from Supabase storage
      const { data: reportData, error: reportError } = await supabase
        .storage
        .from('ishanya')
        .list(`student-reports/${studentId}`);
        
      if (reportError) {
        console.error('Error fetching reports:', reportError);
        setLoadingReports(false);
        return;
      }
      
      setReports(reportData || []);
      setLoadingReports(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoadingReports(false);
    }
  };
  
  const handleViewReport = async (fileName: string) => {
    if (!selectedStudentId) return;
    
    try {
      toast.loading('Opening report...');
      
      const { data, error } = await supabase
        .storage
        .from('ishanya')
        .createSignedUrl(`student-reports/${selectedStudentId}/${fileName}`, 60);
        
      if (error || !data) {
        toast.dismiss();
        toast.error('Failed to generate URL for the report');
        return;
      }
      
      toast.dismiss();
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error('An error occurred while trying to view the report');
    }
  };
  
  const handleStudentChange = (studentId: number) => {
    setSelectedStudentId(studentId);
    fetchReportsForStudent(studentId);
  };
  
  const handleUploadSuccess = () => {
    setShowUploader(false);
    if (selectedStudentId) {
      fetchReportsForStudent(selectedStudentId);
    }
    toast.success('Your report has been uploaded successfully');
  };

  const handleDownloadReport = async () => {
    if (!selectedStudentId) return;
    
    setLoadingReport(true);
    
    try {
      // Get the latest quarter for reporting
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      let quarter;
      if (currentMonth >= 1 && currentMonth <= 3) {
        quarter = `January ${currentYear} - March ${currentYear}`;
      } else if (currentMonth >= 4 && currentMonth <= 6) {
        quarter = `April ${currentYear} - June ${currentYear}`;
      } else if (currentMonth >= 7 && currentMonth <= 9) {
        quarter = `July ${currentYear} - September ${currentYear}`;
      } else {
        quarter = `October ${currentYear} - December ${currentYear}`;
      }
      
      // Get student details to find program and educator
      const activeStudent = students.find(s => s.student_id === selectedStudentId);
      
      if (!activeStudent) {
        toast.error('Student information not found');
        setLoadingReport(false);
        return;
      }
      
      const response = await axios({
        method: 'post',
        url: 'https://fast-api-ubv8.onrender.com/generate_report',
        data: {
          student_id: selectedStudentId,
          program_id: activeStudent.program_id,
          educator_employee_id: activeStudent.educator_employee_id,
          quarter: quarter
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeStudent.first_name}_${activeStudent.last_name}_${quarter.replace(/\s/g, '_')}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading report:', error);
      
      if (error.response?.status === 404) {
        toast.error('No report data found for this student');
      } else {
        toast.error('Failed to download report');
      }
    } finally {
      setLoadingReport(false);
    }
  };
  
  const [progressData, setProgressData] = useState([
    { 
      date: '12/1/2023', 
      activity: 'Reading Session', 
      progress: 'Good', 
      notes: 'Completed 3 pages' 
    },
    { 
      date: '12/5/2023', 
      activity: 'Math Exercise', 
      progress: 'Excellent', 
      notes: 'Mastered addition' 
    },
    { 
      date: '12/10/2023', 
      activity: 'Speech Therapy', 
      progress: 'Improving', 
      notes: 'Pronounced 5 new words' 
    },
    { 
      date: '12/15/2023', 
      activity: 'Physical Activity', 
      progress: 'Good', 
      notes: 'Participated enthusiastically' 
    }
  ]);
  const [feedbackText, setFeedbackText] = useState('My child is doing well');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackText(e.target.value);
  };
  
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !selectedStudentId) return;
    
    setSubmittingFeedback(true);
    
    try {
      // Update parent feedback in database
      const { error } = await supabase
        .from('parents')
        .update({ feedback: feedbackText })
        .eq('student_id', selectedStudentId)
        .eq('email', user?.email || '');
        
      if (error) {
        console.error('Error submitting feedback:', error);
        toast.error('Failed to submit feedback');
      } else {
        toast.success('Feedback submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('An error occurred while submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };
  
  if (loading) {
    return (
      <Layout title="Loading" subtitle="Please wait...">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Error" subtitle="Something went wrong">
        <ErrorDisplay message={error} />
      </Layout>
    );
  }
  
  const activeStudent = students.find(s => s.student_id === selectedStudentId) || students[0];
  
  return (
    <Layout title="Student Profile" subtitle={`${activeStudent?.first_name || 'Student'} ${activeStudent?.last_name || 'Profile'}`}>
      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-end">
          <Button 
            onClick={handleDownloadReport}
            disabled={loadingReport}
            className="bg-green-600 hover:bg-green-700"
          >
            {loadingReport ? <LoadingSpinner size="sm" /> : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Report
              </>
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full p-0 bg-slate-100 rounded-lg">
            <TabsTrigger value="personal-info" className="flex-1 py-3 data-[state=active]:bg-white rounded-lg">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="education-details" className="flex-1 py-3 data-[state=active]:bg-white rounded-lg">
              Education Details
            </TabsTrigger>
            <TabsTrigger value="health-development" className="flex-1 py-3 data-[state=active]:bg-white rounded-lg">
              Health & Development
            </TabsTrigger>
            <TabsTrigger value="progress-contact" className="flex-1 py-3 data-[state=active]:bg-white rounded-lg">
              Progress & Contact
            </TabsTrigger>
          </TabsList>
          
          
          <TabsContent value="personal-info" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarFallback className="text-5xl bg-slate-200 text-slate-500">
                        <User className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{activeStudent?.first_name} {activeStudent?.last_name}</h2>
                    <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                      {activeStudent?.status || 'Active'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Student ID:</span>
                      <span className="font-medium">{activeStudent?.student_id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium">{activeStudent?.gender}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-medium">{activeStudent?.dob ? new Date(activeStudent.dob).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Enrollment Year:</span>
                      <span className="font-medium">{activeStudent?.enrollment_year}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{activeStudent?.student_email || activeStudent?.parents_email || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Family Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">Parent Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Father's Name</span>
                        <span className="font-medium">{activeStudent?.fathers_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Mother's Name</span>
                        <span className="font-medium">{activeStudent?.mothers_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Primary Contact</span>
                        <span className="font-medium">{activeStudent?.contact_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Alternative Contact</span>
                        <span className="font-medium">{activeStudent?.alt_contact_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Address & Transport</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Home Address</span>
                        <span className="font-medium">{activeStudent?.address || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">Transport Details</span>
                        <span className="font-medium">{activeStudent?.transport_required ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-md font-medium">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Student Reports
                  </div>
                </CardTitle>
                <Button 
                  onClick={() => setShowUploader(true)} 
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Report
                </Button>
              </CardHeader>
              <CardContent>
                {showUploader ? (
                  <ReportUploader 
                    onSuccess={handleUploadSuccess} 
                    onCancel={() => setShowUploader(false)}
                    studentId={selectedStudentId || undefined}
                  />
                ) : (
                  <div>
                    {loadingReports ? (
                      <div className="flex justify-center p-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Upload className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>No reports have been uploaded yet</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setShowUploader(true)}
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
          </TabsContent>
          
          <TabsContent value="education-details" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Program & Session Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-10">
                  {/* Left Column - Program Details */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-lg">Program Details</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-1">Assigned Program</p>
                        <p className="text-xl font-semibold">
                          {activeStudent?.program_name || 'Siddhi'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-1">Number of Sessions</p>
                        <p className="text-xl font-semibold">
                          {activeStudent?.number_of_sessions || 3}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-1">Session Type</p>
                        <p className="text-xl font-semibold">
                          {activeStudent?.session_type || 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Schedule Information */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-lg">Schedule Information</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-1">Scheduled Days</p>
                        <p className="text-xl font-semibold">
                          {activeStudent?.scheduled_days || 'Monday, Thursday'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-1">Session Timings</p>
                        <p className="text-xl font-semibold">
                          {activeStudent?.session_timings || '10:30 AM - 11:30 AM'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-1">Assigned Educator</p>
                        <p className="text-xl font-semibold">
                          {activeStudent?.educator_name || 'Neeraj Thakur'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Educator Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-semibold">
                        {activeStudent?.educator_name || 'Neeraj Thakur'}
                      </h3>
                      <p className="text-gray-500">Educator</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <p className="text-gray-500 mb-1">Email</p>
                        <p className="text-blue-600">
                          {activeStudent?.educator_email || 'neeraj.thakur@gmail.com'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 mb-1">Phone</p>
                        <p className="font-medium">
                          {activeStudent?.educator_phone || '9876543312'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="health-development" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Health & Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Medical Information</h3>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Primary Diagnosis</span>
                      <span className="font-medium">{activeStudent?.primary_diagnosis || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Comorbidity</span>
                      <span className="font-medium">{activeStudent?.comorbidity || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Blood Group</span>
                      <span className="font-medium">{activeStudent?.blood_group || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Allergies</span>
                      <span className="font-medium">{activeStudent?.allergies || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">UDID</span>
                      <span className="font-medium">{activeStudent?.udid || 'Not available'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Developmental Progress</h3>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Strengths</span>
                      <span className="font-medium">{activeStudent?.strengths || 'Not assessed yet'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Areas for Improvement</span>
                      <span className="font-medium">{activeStudent?.weakness || 'Not assessed yet'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Additional Comments</span>
                      <span className="font-medium">{activeStudent?.comments || 'No comments available'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Special Requirements</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      {activeStudent?.special_requirements || 'No special requirements have been recorded.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress-contact" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell>{item.activity}</TableCell>
                        <TableCell>
                          <Badge className={
                            item.progress === 'Excellent' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            item.progress === 'Good' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }>
                            {item.progress}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Feedback & Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Share your thoughts, concerns, or feedback about your child's progress or educational needs. This information will be reviewed by our staff.
                  </p>
                  
                  <Textarea 
                    value={feedbackText}
                    onChange={handleFeedbackChange}
                    placeholder="Type your feedback here..."
                    className="min-h-[150px]"
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {submittingFeedback ? <LoadingSpinner size="sm" /> : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-purple-500" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Family Contacts</h3>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Primary Contact</span>
                      <span className="font-medium">{activeStudent?.contact_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Alternative Contact</span>
                      <span className="font-medium">{activeStudent?.alt_contact_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Parent Email</span>
                      <span className="font-medium">{activeStudent?.parents_email || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">School Contacts</h3>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Educator Name</span>
                      <span className="font-medium">{activeStudent?.educator_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Educator Email</span>
                      <span className="font-medium">{activeStudent?.educator_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Center Phone</span>
                      <span className="font-medium">Available during center hours</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
