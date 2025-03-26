
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { AccessibilityMenu } from '@/components/ui/AccessibilityMenu';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';

const Navbar = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  // Handle logout
  const handleLogout = () => {
    // Clear user from local storage
    localStorage.removeItem('user');
    toast.success(t("login.logout_success") || "Logged out successfully");
    navigate('/login');
  };
  
  if (!user) return null;
  
  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get color based on user role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-500 text-white';
      case 'hr':
        return 'bg-purple-500 text-white';
      case 'teacher':
        return 'bg-blue-500 text-white';
      case 'parent':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <nav className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <div className="bg-white rounded-md p-1">
                  <img 
                    src="/lovable-uploads/a6017f5f-7947-49ad-a9ed-0bc0e588a9b0.png" 
                    alt="Ishanya Foundation" 
                    className="h-10 w-auto" 
                  />
                </div>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Accessibility Menu */}
            <AccessibilityMenu />
            
            {/* User menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={getRoleColor(user.role)}>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs font-medium mt-1 bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 w-fit">
                      {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
