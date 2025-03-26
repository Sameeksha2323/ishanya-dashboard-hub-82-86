
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
import { Clock, FileText, Upload } from 'lucide-react';
import ReportUploader from '@/components/parent/ReportUploader';

const ParentDetailsPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('student-info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [parentData, setParentData] = useState<any | null>(null);
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
    <Layout title="Parent Portal" subtitle={`Welcome, ${user?.name || 'Parent'}`}>
      <div className="grid grid-cols-1 gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="student-info">Student Information</TabsTrigger>
            <TabsTrigger value="progress">Progress Reports</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student-info" className="space-y-6">
            {students.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Select Student:</label>
                      <div className="flex flex-wrap gap-2">
                        {students.map((student) => (
                          <Button
                            key={student.student_id}
                            variant={selectedStudentId === student.student_id ? "default" : "outline"}
                            onClick={() => handleStudentChange(student.student_id)}
                          >
                            {student.first_name} {student.last_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeStudent && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p>{activeStudent.first_name} {activeStudent.last_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Student ID</p>
                              <p>{activeStudent.student_id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Gender</p>
                              <p>{activeStudent.gender}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date of Birth</p>
                              <p>{new Date(activeStudent.dob).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p>{activeStudent.student_email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Contact</p>
                              <p>{activeStudent.contact_number}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Address</h3>
                          <p>{activeStudent.address || 'No address provided'}</p>
                        </div>
                        
                        {activeStudent.allergies && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Allergies</h3>
                            <p>{activeStudent.allergies}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Program Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Program ID</p>
                              <p>{activeStudent.program_id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Enrollment Year</p>
                              <p>{activeStudent.enrollment_year}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p>{activeStudent.status}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Sessions</p>
                              <p>{activeStudent.number_of_sessions || 0}</p>
                            </div>
                          </div>
                        </div>
                        
                        {activeStudent.strengths && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Strengths</h3>
                            <p>{activeStudent.strengths}</p>
                          </div>
                        )}
                        
                        {activeStudent.weakness && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
                            <p>{activeStudent.weakness}</p>
                          </div>
                        )}
                        
                        {activeStudent.comments && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Additional Comments</h3>
                            <p>{activeStudent.comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
          
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your child's development milestones and achievements over time.
                </p>
                
                <div className="p-6 text-center text-gray-500">
                  <p>Progress reports will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Educators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use this section to communicate with your child's educators.
                </p>
                
                <div className="p-6 text-center text-gray-500">
                  <p>This feature is coming soon. For now, please contact the educators directly via email or phone.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Parent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Your feedback is valuable to us and helps us improve our services.
                </p>
                
                <div className="p-6 text-gray-500">
                  <div className="mb-4">
                    <h3 className="font-medium">Current Feedback:</h3>
                    <p className="italic mt-2">
                      {parentData?.feedback || "No feedback provided yet."}
                    </p>
                  </div>
                  
                  <p>To provide or update your feedback, please contact the administration.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ParentDetailsPage;
