
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Activity {
  transaction_id: number;
  transaction_name: string;
  created_at: string;
}

const ActivitiesSection = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    const activitiesChannel = supabase
      .channel('webdata-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webdata'
      }, () => {
        fetchActivities();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(activitiesChannel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webdata')
        .select('transaction_id, transaction_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-lg border-t-4 border-blue-500 rounded-lg overflow-hidden h-full">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-500" />
          Recent Activities
        </h3>
      </div>
      <div className="bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <LoadingSpinner />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No recent activities found
          </div>
        ) : (
          <ScrollArea className="h-64 p-4">
            <div className="p-4">
              {activities.map((activity) => (
                <div 
                  key={activity.transaction_id} 
                  className="mb-4 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{activity.transaction_name}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ActivitiesSection;
