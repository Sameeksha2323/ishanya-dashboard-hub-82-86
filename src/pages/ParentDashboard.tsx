import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Clock } from 'lucide-react';
import ReportUploader from '@/components/parent/ReportUploader';

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    let isMounted = true;
    
    const checkParentStatus = async () => {
      if (!user) {
        if (isMounted) {
          setError("Not logged in");
          setLoading(false);
        }
        return;
      }
      
      try {
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
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
        
        if (!parentData) {
          if (isMounted) {
            setError("No parent record found. Please contact the administrator.");
            setLoading(false);
          }
          return;
        }

        if (parentData.student_id) {
          const { data: reportData, error: reportError } = await supabase
            .storage
            .from('ishanya')
            .list(`student-reports/${parentData.student_id}`);
            
          if (!reportError && reportData && isMounted) {
            setReports(reportData);
          }
        }

        if (isMounted) {
          if (loading) {
            toast({
              title: "Welcome to your dashboard",
              description: "View your child's details for more information",
            });
          }
          setLoading(false);
        }
        
      } catch (error) {
        console.error('Error checking parent status:', error);
        if (isMounted) {
          setError("An unexpected error occurred. Please try again later.");
          setLoading(false);
        }
      }
    };
    
    checkParentStatus();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  const fetchReports = async () => {
    if (!user) return;
    
    try {
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('student_id')
        .eq('email', user.email)
        .single();
        
      if (parentError || !parentData || !parentData.student_id) {
        console.error('Error fetching parent data:', parentError);
        return;
      }
      
      const { data: reportData, error: reportError } = await supabase
        .storage
        .from('ishanya')
        .list(`student-reports/${parentData.student_id}`);
        
      if (reportError) {
        console.error('Error fetching reports:', reportError);
        return;
      }
      
      setReports(reportData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  const handleUploadSuccess = () => {
    setShowUploader(false);
    fetchReports();
    toast({
      title: "Success",
      description: "Your report has been uploaded successfully",
    });
  };
  
  const handleViewStudentInfo = () => {
    navigate('/parent/details', { state: { activeTab: 'student-info' } });
  };
  
  const handleViewProgress = () => {
    navigate('/parent/details', { state: { activeTab: 'progress' } });
  };
  
  const handleViewCommunication = () => {
    navigate('/parent/details', { state: { activeTab: 'communication' } });
  };
  
  const handleViewReport = async (fileName: string) => {
    if (!user) return;
    
    try {
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('student_id')
        .eq('email', user.email)
        .single();
        
      if (parentError || !parentData || !parentData.student_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not determine student ID",
        });
        return;
      }
      
      const { data, error } = await supabase
        .storage
        .from('ishanya')
        .createSignedUrl(`student-reports/${parentData.student_id}/${fileName}`, 60);
        
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
  
  return (
    <Layout
      title="Parent Dashboard"
      subtitle={`Welcome, ${user?.name || 'Parent'}`}
    >
      <div className="grid grid-cols-1 gap-6 mb-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : (
          <>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Your Parent Portal</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Access your child's information, communicate with educators, and track progress all in one place.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">Student Information</h3>
                  <p className="text-gray-600 mb-4">View detailed information about your child, including personal details, program enrollment, and session schedules.</p>
                  <Button onClick={handleViewStudentInfo} className="w-full">
                    View Details
                  </Button>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Progress Tracking</h3>
                  <p className="text-gray-600 mb-4">Monitor your child's progress, download reports, and stay updated on their development journey.</p>
                  <Button variant="outline" onClick={handleViewProgress} className="w-full">
                    Track Progress
                  </Button>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Educator Communication</h3>
                <p className="text-gray-600 mb-4">Contact your child's assigned educators, share feedback, and maintain open communication to support their learning journey.</p>
                <Button variant="outline" onClick={handleViewCommunication} className="w-full">
                  Contact & Feedback
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Student Reports
                  </CardTitle>
                  <Button 
                    onClick={() => setShowUploader(true)} 
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showUploader ? (
                  <ReportUploader 
                    onSuccess={handleUploadSuccess} 
                    onCancel={() => setShowUploader(false)}
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
                                <p className="font-medium">{report.name}</p>
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default ParentDashboard;
