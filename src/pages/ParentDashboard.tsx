
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Clock, ChevronDown } from 'lucide-react';
import ReportUploader from '@/components/parent/ReportUploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StudentInfo = {
  student_id: number;
  first_name: string;
  last_name: string;
};

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const initialized = useRef(false);
  
  useEffect(() => {
    // Redirect directly to details page
    navigate('/parent/details');
    return;
  }, [navigate]);
  
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
          .eq('email', user.email);
          
        if (parentError) {
          console.error('Error fetching parent data:', parentError);
          if (isMounted) {
            setError("Unable to fetch parent information. Please contact support.");
            setLoading(false);
          }
          return;
        }
        
        if (!parentData || parentData.length === 0) {
          if (isMounted) {
            setError("No parent record found. Please contact the administrator.");
            setLoading(false);
          }
          return;
        }

        // Get all student IDs associated with this parent
        const studentIds = parentData.map(p => p.student_id).filter(Boolean);
        
        if (studentIds.length > 0) {
          // Fetch student details
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('student_id, first_name, last_name')
            .in('student_id', studentIds);
            
          if (!studentError && studentData && studentData.length > 0) {
            setStudents(studentData);
            setSelectedStudentId(studentData[0].student_id);
            
            // Fetch reports for the first student
            await fetchReportsForStudent(studentData[0].student_id);
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
  }, [loading, user]);
  
  const fetchReportsForStudent = async (studentId: number) => {
    if (!studentId) return;
    
    try {
      // Get reports from Supabase storage
      const { data: reportData, error: reportError } = await supabase
        .storage
        .from('ishanya')
        .list(`student-reports/${studentId}`);
        
      if (reportError) {
        console.error('Error fetching reports:', reportError);
        return;
      }
      
      setReports(reportData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  const handleStudentChange = (studentId: string) => {
    const id = parseInt(studentId);
    setSelectedStudentId(id);
    fetchReportsForStudent(id);
  };
  
  const handleUploadSuccess = () => {
    setShowUploader(false);
    if (selectedStudentId) {
      fetchReportsForStudent(selectedStudentId);
    }
    toast({
      title: "Success",
      description: "Your report has been uploaded successfully",
    });
  };
  
  const handleViewReport = async (fileName: string) => {
    if (!user || !selectedStudentId) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('ishanya')
        .createSignedUrl(`student-reports/${selectedStudentId}/${fileName}`, 60);
        
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
  
  // We're redirecting directly to details, so this component won't be rendered
  return null;
};

export default ParentDashboard;
