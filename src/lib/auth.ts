
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'administrator' | 'educator' | 'parent' | 'employee' | 'hr';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  student_id?: number;
  employee_id?: number;
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

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
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
