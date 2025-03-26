
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/components/ui/LanguageProvider";
import Index from "./pages/Index";
import HRDashboard from "./pages/HRDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ParentDetailsPage from "./pages/ParentDetailsPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { isAuthenticated, getCurrentUser } from "./lib/auth";
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import LandingPage from './pages/LandingPage';
import StudentPerformance from './pages/StudentPerformance';
import StudentDetails from './pages/StudentDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const isLoggedIn = isAuthenticated();
  const userRole = getCurrentUser()?.role;

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider defaultLanguage="english">
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Sonner 
              position="bottom-right" 
              className="dark:bg-gray-800 dark:text-white"
              closeButton={true}
              toastOptions={{
                closeButton: true,
                duration: 4000,
              }}
              theme="light"
            />
            <BrowserRouter>
              <Routes>
                {/* Public routes - Landing page is always accessible */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Login route - redirects to dashboard if already logged in */}
                <Route path="/login" element={
                  isLoggedIn ? <Navigate to={getDefaultRoute(userRole)} /> : <Login />
                } />
                
                {/* Admin/default dashboard - only for administrators */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['administrator']}>
                    <Index />
                  </ProtectedRoute>
                } />
                
                {/* Student Performance - for administrators */}
                <Route path="/admin/student-performance" element={
                  <ProtectedRoute allowedRoles={['administrator']}>
                    <StudentPerformance />
                  </ProtectedRoute>
                } />
                
                {/* Student Details - for administrators */}
                <Route path="/admin/student-details/:studentId" element={
                  <ProtectedRoute allowedRoles={['administrator']}>
                    <StudentDetails />
                  </ProtectedRoute>
                } />
                
                {/* HR Dashboard - only for HR */}
                <Route path="/hr" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <HRDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Teacher Dashboard - only for teachers */}
                <Route path="/teacher" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Parent Dashboard - only for parents */}
                <Route path="/parent" element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Parent Details Page - only for parents */}
                <Route path="/parent/details" element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDetailsPage />
                  </ProtectedRoute>
                } />
                
                {/* HR Employees Detail Page - only for HR and administrators */}
                <Route 
                  path="/hr/employees/:employeeId" 
                  element={
                    <ProtectedRoute allowedRoles={['hr', 'administrator']}>
                      <EmployeeDetailPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Not found routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

// Helper function to determine default route based on user role
const getDefaultRoute = (role: string | null): string => {
  switch (role) {
    case 'administrator':
      return '/admin';
    case 'hr':
      return '/hr';
    case 'teacher':
      return '/teacher';
    case 'parent':
      return '/parent';
    default:
      return '/login';
  }
};

export default App;
