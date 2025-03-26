
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'administrator' | 'educator' | 'parent' | 'employee' | 'hr' | 'teacher';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  student_id?: number;
  employee_id?: number;
  center_id?: number;
  isAdmin?: boolean;
};

// Load user from localStorage (caching mechanism)
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Set the current user in localStorage
export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Check if the current user has a specific role
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Get the current user's role
export const getUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Check if the user is an administrator
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'administrator';
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// Authenticate user with email and password
export const authenticateUser = async (
  email: string, 
  password: string, 
  role: string
): Promise<{ success: boolean; message?: string; user?: User }> => {
  try {
    // First check if it's a parent login
    if (role === 'parent') {
      const { data: parents, error: parentsError } = await supabase
        .from('parents')
        .select('*')
        .eq('email', email)
        .eq('password', password);
        
      if (parentsError) {
        console.error('Parent login error:', parentsError);
        return { success: false, message: 'Authentication failed' };
      }
      
      if (parents && parents.length > 0) {
        // Create a user object
        const user: User = {
          id: parents[0].id.toString(),
          email: parents[0].email,
          name: parents[0].email.split('@')[0], // Simple name from email
          role: 'parent',
          student_id: parents[0].student_id
        };
        
        return { success: true, user };
      }
    }
    
    // For other roles, check the employees table
    if (['administrator', 'hr', 'teacher'].includes(role)) {
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('password', password);
        
      if (employeesError) {
        console.error('Employee login error:', employeesError);
        return { success: false, message: 'Authentication failed' };
      }
      
      if (employees && employees.length > 0) {
        // Map employee role to user role
        let userRole: UserRole = 'employee';
        
        // Determine role based on designation or role selection
        if (role === 'administrator' && employees[0].designation === 'Administrator') {
          userRole = 'administrator';
        } else if (role === 'hr' && employees[0].designation === 'HR') {
          userRole = 'hr';
        } else if (role === 'teacher' && employees[0].designation === 'Educator') {
          userRole = 'teacher';
        } else {
          return { success: false, message: 'Your role does not match the selected role' };
        }
        
        // Create a user object
        const user: User = {
          id: employees[0].id,
          email: employees[0].email,
          name: employees[0].name,
          role: userRole,
          employee_id: employees[0].employee_id,
          center_id: employees[0].center_id,
          isAdmin: userRole === 'administrator'
        };
        
        return { success: true, user };
      }
    }
    
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during authentication' };
  }
};

// Log out the current user
export const logout = async () => {
  // Clear Supabase auth session
  await supabase.auth.signOut();
  
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  
  // Redirect to login page
  window.location.href = '/login';
};
