
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const checkParentStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
          .eq('email', user.email);
          
        if (parentError) {
          console.error('Error fetching parent data:', parentError);
          return;
        }
        
        // Redirect directly to details page
        navigate('/parent/details');
      } catch (error) {
        console.error('Error checking parent status:', error);
      }
    };
    
    checkParentStatus();
  }, [navigate, user]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default ParentDashboard;
