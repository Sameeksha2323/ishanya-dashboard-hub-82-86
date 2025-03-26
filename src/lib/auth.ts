
import supabase from './api';
import { toast } from 'sonner';

// Define user types
export type User = {
  id: string;
  employee_id?: number;
  parent_id?: number;
  student_id?: number; // For parent to know which student they're linked to
  name: string;
  email: string;
  isAdmin: boolean;
  center_id?: number;
  department?: string;
  designation?: string;
  role: 'administrator' | 'hr' | 'teacher' | 'parent';
}

// Authenticate a user with email, password and role
export const authenticateUser = async (
  email: string, 
  password: string, 
  role: string
): Promise<{ 
  success: boolean; 
  user?: User; 
  message?: string; 
}> => {
  try {
    console.log('Authenticating user with email:', email, 'and role:', role);
    
    // For administrator, HR, and teacher roles, check the employees table
    if (['administrator', 'hr', 'teacher'].includes(role)) {
      // Get the employee record with the matching email and password
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('password', password) // In a real app, this should use hashed passwords with bcrypt
        .limit(1);
      
      if (error) {
        console.error('Authentication error:', error);
        return { 
          success: false, 
          message: 'An error occurred during authentication' 
        };
      }
      
      if (!employees || employees.length === 0) {
        return { 
          success: false, 
          message: 'Invalid email or password' 
        };
      }
      
      const employee = employees[0];
      
      // Check if the employee's role matches the selected role
      let userRole: 'administrator' | 'hr' | 'teacher' | null = null;
      let isAdmin = false;
      
      // Updated role checks - more specific checks for department and designation
      if (role === 'administrator') {
        // Admin if department is admin or designation contains admin
        isAdmin = employee.department?.toLowerCase() === 'admin' || 
                employee.designation?.toLowerCase().includes('admin');
        if (isAdmin) {
          userRole = 'administrator';
        }
      } else if (role === 'hr') {
        // HR if department is HR or designation contains HR
        const isHr = employee.department?.toLowerCase() === 'hr' || 
                    employee.designation?.toLowerCase().includes('hr');
        if (isHr) {
          userRole = 'hr';
        }
      } else if (role === 'teacher') {
        // Teacher if designation contains educator or teacher or department is educator
        const isTeacher = employee.designation?.toLowerCase().includes('educator') || 
                         employee.designation?.toLowerCase().includes('teacher') ||
                         employee.department?.toLowerCase() === 'educator';
        if (isTeacher) {
          userRole = 'teacher';
        }
      }
      
      if (!userRole) {
        return {
          success: false,
          message: 'You do not have permission to access the system with the selected role'
        };
      }
      
      // Create user object
      const user: User = {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        isAdmin: isAdmin,
        center_id: employee.center_id,
        department: employee.department,
        designation: employee.designation,
        role: userRole
      };
      
      console.log('User authenticated:', user);
      return { 
        success: true, 
        user 
      };
    } 
    // For parent role, check the parents table
    else if (role === 'parent') {
      // Query the parents table in Supabase
      const { data: parents, error } = await supabase
        .from('parents')
        .select('*, students(*)')
        .eq('email', email)
        .eq('password', password)
        .limit(1);
      
      if (error) {
        console.error('Parent authentication error:', error);
        return { 
          success: false, 
          message: 'An error occurred during parent authentication' 
        };
      }
      
      if (!parents || parents.length === 0) {
        return { 
          success: false, 
          message: 'Invalid parent credentials' 
        };
      }
      
      const parent = parents[0];
      
      // Create parent user object
      const parentUser: User = {
        id: parent.id.toString(),
        parent_id: parent.id || 0,
        student_id: parent.student_id || 0,
        name: parent.email.split('@')[0] || 'Parent', // Use first part of email as name if available
        email: parent.email,
        isAdmin: false,
        center_id: 0, // Default value since parents table might not have center_id
        role: 'parent'
      };
      
      console.log('Parent user authenticated:', parentUser);
      return {
        success: true,
        user: parentUser
      };
    }
    
    return {
      success: false,
      message: 'Invalid role selected'
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: 'An error occurred during authentication' 
    };
  }
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('user');
  return !!user;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    return null;
  }
};

// Log out user
export const logout = (): void => {
  localStorage.removeItem('user');
  toast.success('You have been logged out');
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user ? user.isAdmin || user.role === 'administrator' : false;
};

// Check user role
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};
