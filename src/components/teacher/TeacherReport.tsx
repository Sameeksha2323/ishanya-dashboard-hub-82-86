
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TeacherReport = () => {
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id')
          .eq('email', user.email)
          .single();
          
        if (error) {
          console.error('Error fetching employee data:', error);
          return;
        }
        
        if (data?.employee_id) {
          setEmployeeId(data.employee_id);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeId();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Report</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  const reportUrl = `https://ishanya-teacher-reporting.vercel.app?educator_employee_id=${employeeId || ''}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Report</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[70vh]">
        <iframe 
          src={reportUrl}
          title="Teacher Report"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </CardContent>
    </Card>
  );
};

export default TeacherReport;
