
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Activity {
  id: string;
  user_name: string;
  action: string;
  table_name: string;
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
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      // Map the data to match the Activity interface
      const mappedActivities: Activity[] = (data || []).map(item => ({
        id: item.id || String(item.transaction_id) || String(Math.random()),
        user_name: item.user_name || 'Admin User',
        action: item.transaction_name || item.action || 'Updated record',
        table_name: item.table_name || 'system',
        created_at: item.created_at
      }));
      
      setActivities(mappedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-t-4 border-blue-500">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-500" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <LoadingSpinner />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No recent activities found
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="p-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="mb-4 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full mt-1">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.user_name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">
                          {activity.action} in {activity.table_name}
                        </p>
                      </div>
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
      </CardContent>
    </Card>
  );
};

export default ActivitiesSection;
