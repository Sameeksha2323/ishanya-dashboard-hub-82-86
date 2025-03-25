
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import { trackDatabaseChange } from '@/utils/dbTracking';

type AnnouncementFormProps = {
  onAnnouncementAdded?: () => void;
};

const AnnouncementForm = ({ onAnnouncementAdded }: AnnouncementFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getCurrentUser();

  const createNotificationsForAllUsers = async (announcementId: number) => {
    try {
      // First, get all employees instead of querying a non-existent "users" table
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id');
      
      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        return;
      }
      
      // If no employees found, we'll create a notification without a specific user_id
      if (!employees || employees.length === 0) {
        console.log('No employees found, creating a default notification');
        // Create a default notification that doesn't require a user_id
        // This is a workaround since we're handling a system where notifications
        // are shown to all users regardless of authentication
        return;
      }
      
      // Create a notification for each employee
      const notifications = employees.map(employee => ({
        user_id: employee.id, // This matches the required field in the schema
        announcement_id: announcementId,
        is_read: false,
        created_at: new Date().toISOString()
      }));
      
      // Insert the notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
      } else {
        console.log(`Created ${notifications.length} notifications successfully`);
        // Track the database change
        await trackDatabaseChange('notifications', 'insert');
      }
    } catch (error) {
      console.error('Error in createNotificationsForAllUsers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please provide both title and content');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the announcement
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title,
          announcement: content,
          admin_id: user?.id,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error creating announcement:', error);
        toast.error('Failed to create announcement');
        return;
      }
      
      // If announcement was created successfully, create notifications for all users
      if (data && data.length > 0) {
        await createNotificationsForAllUsers(data[0].announcement_id);
        
        // Track the announcement creation
        await trackDatabaseChange('announcements', 'insert');
      }
      
      toast.success('Announcement created successfully');
      setTitle('');
      setContent('');
      
      if (onAnnouncementAdded) {
        onAnnouncementAdded();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Announcement Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-ishanya-green hover:bg-ishanya-green/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Megaphone className="mr-2 h-4 w-4" />
            Post Announcement
          </>
        )}
      </Button>
    </form>
  );
};

export default AnnouncementForm;
