
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';
import supabase from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type AnnouncementFormProps = {
  onAnnouncementAdded?: () => void;
};

const AnnouncementForm = ({ onAnnouncementAdded }: AnnouncementFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createNotificationsForAllUsers = async (announcementId: number) => {
    try {
      // First, get all users to create notifications for them
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }
      
      // Create a notification for each user
      if (users && users.length > 0) {
        const notifications = users.map(user => ({
          user_id: user.id,
          announcement_id: announcementId,
          is_read: false,
          created_at: new Date().toISOString()
        }));
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);
        
        if (notificationError) {
          console.error('Error creating notifications:', notificationError);
        }
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
      }
      
      toast.success('Announcement created successfully');
      setTitle('');
      setContent('');
      
      // Log this action to webdata table
      await supabase
        .from('webdata')
        .insert({
          transaction_name: `New announcement: ${title}`,
          created_at: new Date().toISOString()
        });
      
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
