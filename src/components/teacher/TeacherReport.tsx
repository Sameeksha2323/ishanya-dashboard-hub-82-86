
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TeacherReport = () => {
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user?.email) {
        setError('User email not found');
        setLoading(false);
        return;
      }

      try {
        // Query the employees table to get the employee_id
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching employee data:', error);
          setError('Could not fetch employee information');
        } else if (data) {
          setEmployeeId(data.employee_id);
        } else {
          setError('Employee record not found');
        }
      } catch (err) {
        console.error('Error in fetching employee ID:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeId();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !employeeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'Could not load the reporting interface'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Construct the URL with the employee_id parameter
  const reportUrl = `https://ishanya-teacher-reporting.vercel.app?educator_employee_id=${employeeId}`;

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Teacher Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100vh-240px)]">
          <iframe 
            src={reportUrl}
            className="w-full h-full border-0"
            title="Teacher Reporting Interface"
            allowFullScreen
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherReport;
