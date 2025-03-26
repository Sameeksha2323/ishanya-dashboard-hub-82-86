
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, BookOpen, User, Kanban } from 'lucide-react';
import { logout, getCurrentUser, getUserRole } from '@/lib/auth';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageProvider';
import NotificationMenu from './NotificationMenu';

export function DashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const userRole = getUserRole();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success(t('login.logout_success'), {
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };

  const getButtonClassName = (path: string) => {
    return location.pathname === path 
      ? 'bg-ishanya-green/10 text-ishanya-green hover:bg-ishanya-green/20' 
      : 'hover:bg-gray-100';
  };

  // Function to open Kanban board with employee ID
  const openKanbanBoard = () => {
    if (user?.employee_id) {
      window.open(`https://goalwize.vercel.app/kanban/${user.employee_id}`, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Could not retrieve your employee ID.');
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2">
      {/* Notification menu */}
      <NotificationMenu />
      
      {/* Show admin dashboard link only to administrators */}
      {userRole === 'administrator' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/')}
        >
          <Link to="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      {/* Show HR dashboard link only to HR */}
      {userRole === 'hr' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/hr')}
        >
          <Link to="/hr">
            <Users className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      {/* Show Teacher dashboard link only to educators */}
      {userRole === 'educator' && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className={getButtonClassName('/teacher')}
          >
            <Link to="/teacher">
              <BookOpen className="h-5 w-5" />
            </Link>
          </Button>
          
          {/* Kanban Board Button for Teachers */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openKanbanBoard}
            className="hover:bg-gray-100"
            title="Kanban Board"
          >
            <Kanban className="h-5 w-5" />
          </Button>
        </>
      )}
      
      {/* Show Parent dashboard link only to parents */}
      {userRole === 'parent' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/parent')}
        >
          <Link to="/parent">
            <User className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleLogout}
        className="hover:bg-red-50 hover:text-red-500"
      >
        <LogOut className="h-5 w-5" />
      </Button>
      
      {user && (
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300 hidden md:inline-block">
          {user.name} ({t(`common.${userRole}`) || userRole})
        </span>
      )}
    </div>
  );
}
