import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type StudentDetailsProps = {
  studentId: number;
  onBack?: () => void;
};

type StudentReport = {
  name: string;
  created_at: string;
  size: number;
  id: string;
};

const StudentDetails = ({ studentId, onBack }: StudentDetailsProps) => {
  const [student, setStudent] = useState<any | null>(null);
  const [parent, setParent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', studentId)
          .single();
          
        if (studentError) {
          console.error('Error fetching student:', studentError);
          setError('Could not load student details');
          return;
        }
        
        setStudent(studentData);
        
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
          .eq('student_id', studentId)
          .single();
          
        if (parentError) {
          console.error('Error fetching parent:', parentError);
          setError('Could not load parent details');
          return;
        }
        
        setParent(parentData);

        await fetchStudentReports(studentId);
      } catch (error) {
        console.error('Error in fetchStudentDetails:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentReports = async (studentId: number) => {
    try {
      setLoadingReports(true);
      
      const { data: reportFiles, error: reportsError } = await supabase
        .storage
        .from('ishanya')
        .list(`student-reports/${studentId}`);
        
      if (reportsError) {
        console.error('Error fetching student reports:', reportsError);
        setReports([]);
        return;
      }
      
      const formattedReports: StudentReport[] = reportFiles ? reportFiles.map(file => ({
        name: file.name,
        created_at: file.created_at,
        size: file.metadata?.size || 0,
        id: file.id
      })) : [];
      
      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching student reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleViewReport = async (fileName: string) => {
    try {
      toast.loading('Opening report...');
      
      const { data, error } = await supabase
        .storage
        .from('ishanya')
        .createSignedUrl(`student-reports/${studentId}/${fileName}`, 60);
        
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

  const displayParentInfo = (parent: any) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p>{parent?.email || 'Not provided'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Feedback</h3>
          <p>{parent?.feedback || 'No feedback provided'}</p>
        </div>
      </div>
    );
  };

  const getProfileImage = (gender: string) => {
    if (gender && gender.toLowerCase() === 'female') {
      return '/lovable-uploads/29e4e0c1-de7b-4d44-86ac-0d3635c81440.png';
    }
    return '/lovable-uploads/fb9542e8-5f06-420d-8d09-80d9058b8158.png';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!student) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Student not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
          <CardDescription>
            <Button onClick={onBack} variant="ghost" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden">
                  <img 
                    src={getProfileImage(student.gender)}
                    alt={`${student.first_name} ${student.last_name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{student.first_name} {student.last_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Student ID: {student.student_id}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p>{student.first_name} {student.last_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{student.student_email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p>{student.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p>{student.dob ? format(new Date(student.dob), 'MMMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                  <p>{student.contact_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p>{student.address || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Program Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Program ID</h3>
                      <p>{student.program_id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Enrollment Year</h3>
                      <p>{student.enrollment_year}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge variant="secondary">{student.status}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Parent Information</h3>
                  {parent ? (
                    displayParentInfo(parent)
                  ) : (
                    <p className="text-muted-foreground">No parent information available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-4">Student Reports</h3>
            {loadingReports ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No reports available for this student.</p>
            ) : (
              <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                {reports.map((report, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{report.name.replace(/^\d+-/, '')}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewReport(report.name)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetails;
