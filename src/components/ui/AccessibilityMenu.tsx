
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Check } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    toast.success(
      `${t('accessibility.theme_changed') || 'Theme changed to'} ${selectedTheme}`,
      { duration: 2000 }
    );
  };

  const handleLanguageChange = (selectedLanguage: 'english' | 'hindi' | 'kannada') => {
    console.log("Changing language to:", selectedLanguage);
    setLanguage(selectedLanguage);
    
    // Log current language after changing
    setTimeout(() => {
      console.log("Language after change:", selectedLanguage);
    }, 100);
    
    toast.success(
      `${t('accessibility.language_changed') || 'Language changed to'} ${t(`common.${selectedLanguage}`) || selectedLanguage}`,
      { duration: 2000 }
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full"
          aria-label={t('accessibility.title') || 'Accessibility Settings'}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('accessibility.title') || 'Accessibility'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('accessibility.theme') || 'Theme'}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer">
          {theme === 'light' && <Check className="h-4 w-4 mr-2" />}
          {t('common.theme.light') || 'Light'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer">
          {theme === 'dark' && <Check className="h-4 w-4 mr-2" />}
          {t('common.theme.dark') || 'Dark'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('accessibility.language') || 'Language'}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleLanguageChange('english')} className="cursor-pointer">
          {language === 'english' && <Check className="h-4 w-4 mr-2" />}
          {t('common.english') || 'English'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('hindi')} className="cursor-pointer">
          {language === 'hindi' && <Check className="h-4 w-4 mr-2" />}
          {t('common.hindi') || 'Hindi'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('kannada')} className="cursor-pointer">
          {language === 'kannada' && <Check className="h-4 w-4 mr-2" />}
          {t('common.kannada') || 'Kannada'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityMenu;
