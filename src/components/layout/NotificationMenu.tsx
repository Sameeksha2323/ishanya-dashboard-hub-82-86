
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  announcement_id: number;
  is_read: boolean;
  created_at: string;
  title?: string;
  announcement?: string;
}

const NotificationMenu = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // First, get unread notifications count
      const { data: unreadData, error: unreadError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false);

      if (unreadError) {
        console.error('Error fetching unread notifications:', unreadError);
        return;
      }
      
      setNotificationCount(unreadData?.length || 0);
      
      // If the popover is open, fetch all notifications with announcement details
      if (isOpen) {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            id,
            announcement_id,
            is_read,
            created_at,
            announcements (
              title,
              announcement
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        if (data) {
          // Map the data to include announcement details
          const notificationsWithAnnouncements = data.map(item => ({
            id: item.id,
            announcement_id: item.announcement_id,
            is_read: item.is_read,
            created_at: item.created_at,
            title: item.announcements?.title,
            announcement: item.announcements?.announcement
          }));
          
          setNotifications(notificationsWithAnnouncements);
        }
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);
    
    // Set up a subscription to notifications table for real-time updates
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchNotifications();
      })
      .subscribe();
    
    // Set up a subscription to announcements table for real-time updates
    const announcementsChannel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, () => {
        fetchNotifications();
      })
      .subscribe();
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(announcementsChannel);
    };
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setNotificationCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error in handleNotificationClick:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to mark notifications as read');
        return;
      }
      
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, is_read: true }))
      );
      setNotificationCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error in handleMarkAllAsRead:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <h3 className="font-medium">Notifications</h3>
          {notificationCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col p-0">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b last:border-0 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                        {notification.title || 'New Announcement'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                      <p className="text-sm mt-2 truncate">
                        {notification.announcement || 'No content available'}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500">No notifications to display</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationMenu;
