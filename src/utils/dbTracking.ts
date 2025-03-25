
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

/**
 * Records database changes made by users in the webdata table
 * @param tableName The name of the table that was changed
 * @param action The action performed (insert, update, delete)
 */
export const trackDatabaseChange = async (tableName: string, action: 'insert' | 'update' | 'delete'): Promise<void> => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      console.warn('No user found for tracking database change');
      return;
    }

    // Get user information based on role
    let userName = 'Unknown User';
    let userRole = user.role || 'unknown';
    
    // Determine name based on role and id
    if (userRole === 'administrator' || userRole === 'hr') {
      // Fetch from employees table
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (employeeData?.name) {
        userName = employeeData.name;
      }
    } else if (userRole === 'teacher' || userRole === 'educator') {
      // Fetch from educators table
      const { data: educatorData } = await supabase
        .from('educators')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (educatorData?.name) {
        userName = educatorData.name;
      }
    }
    
    // If we still don't have a name, try the employees table as a fallback
    if (userName === 'Unknown User') {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (employeeData?.name) {
        userName = employeeData.name;
      }
    }
    
    // Create transaction name with user info, table name, and action
    const actionText = action === 'insert' ? 'added to' : action === 'update' ? 'updated in' : 'deleted from';
    const transactionName = `${userName} (${userRole}) ${actionText} ${tableName}`;
    
    // Log to webdata table
    await supabase
      .from('webdata')
      .insert({
        transaction_name: transactionName,
        created_at: new Date().toISOString()
      });
    
  } catch (error) {
    console.error('Error tracking database change:', error);
  }
};
