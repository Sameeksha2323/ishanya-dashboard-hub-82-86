
import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  Megaphone,
  MailOpen,
  AlertCircle
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  fetchNotificationsWithAnnouncements, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  AnnouncementWithRead
} from '@/services/NotificationService';
import { toast } from 'sonner';

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState<AnnouncementWithRead[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = getCurrentUser();
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for new notifications
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
        
      // Set up real-time subscription for announcements
      const announcementsChannel = supabase
        .channel('announcements-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements'
        }, async (payload) => {
          fetchNotifications();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(notificationsChannel);
        supabase.removeChannel(announcementsChannel);
      };
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const notificationsData = await fetchNotificationsWithAnnouncements();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      if (success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MailOpen className="h-4 w-4 text-green-500" />;
      case 'alert':
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex justify-between items-center border-b p-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-muted-foreground">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 text-muted-foreground/50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getNotificationIcon('announcement')}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.announcement}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationMenu;
