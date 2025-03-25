
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  announcement_id: number;
  is_read: boolean;
  created_at: string;
}

export interface AnnouncementWithRead {
  id: string;
  announcement_id: number;
  title: string;
  announcement: string;
  created_at: string;
  is_read: boolean;
}

export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching notifications count:', error);
      return 0;
    }

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error in fetchUnreadNotificationsCount:', error);
    return 0;
  }
};

export const fetchNotificationsWithAnnouncements = async (): Promise<AnnouncementWithRead[]> => {
  try {
    console.log('Fetching notifications with announcements');
    
    // Join notifications with announcements
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        announcement_id,
        is_read,
        created_at,
        announcements:announcement_id (
          title,
          announcement,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications with announcements:', error);
      throw error;
    }

    // Transform the data to match the expected format
    return data ? data.map(item => ({
      id: item.id,
      announcement_id: item.announcement_id,
      title: item.announcements?.title || 'Unknown Title',
      announcement: item.announcements?.announcement || 'No content',
      created_at: item.announcements?.created_at || item.created_at,
      is_read: item.is_read
    })) : [];
  } catch (error) {
    console.error('Error in fetchNotificationsWithAnnouncements:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return false;
  }
};
