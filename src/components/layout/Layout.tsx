
import { ReactNode, useState } from 'react';
import { DashboardNav } from './DashboardNav';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { AccessibilityMenu } from '@/components/ui/AccessibilityMenu';
import ChatBot from '@/components/chatbot/ChatBot';
import { getCurrentUser } from '@/lib/auth';
import DyslexiaToggle from '@/components/ui/DyslexiaToggle';

type LayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
};

const Layout = ({ title, subtitle, children, showBackButton = false, onBack }: LayoutProps) => {
  const { t } = useLanguage();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const user = getCurrentUser();
  
  // Only show chatbot button for admin, hr, and educator roles
  const shouldShowChatbot = user && ['administrator', 'hr', 'educator'].includes(user.role);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2 dark:text-gray-200 dark:border-gray-700" 
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common.back') || 'Back'}
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t(title) || title}</h1>
              {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{t(subtitle) || subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <DyslexiaToggle />
              <AccessibilityMenu />
            </div>
            {shouldShowChatbot && (
              <Button 
                variant="outline" 
                size="icon"
                className="relative mr-2 dark:text-gray-200 dark:border-gray-700"
                onClick={() => setChatbotOpen(!chatbotOpen)}
                title={t('chatbot.toggle') || 'Toggle chatbot'}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            <DashboardNav />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          {children}
        </div>
      </div>
      
      {shouldShowChatbot && (
        <ChatBot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
