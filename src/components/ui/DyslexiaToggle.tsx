
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/components/ui/LanguageProvider';

export const DyslexiaToggle = () => {
  const { t } = useLanguage();
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    // Check if there's a saved preference in localStorage
    const savedMode = localStorage.getItem('dyslexiaMode');
    return savedMode === 'true';
  });

  // Apply dyslexia class to body when component mounts and when mode changes
  useEffect(() => {
    if (isDyslexiaMode) {
      document.body.classList.add('dyslexia-mode');
    } else {
      document.body.classList.remove('dyslexia-mode');
    }
    
    // Save preference to localStorage
    localStorage.setItem('dyslexiaMode', isDyslexiaMode.toString());
  }, [isDyslexiaMode]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setIsDyslexiaMode(!isDyslexiaMode)}
            className={`rounded-full ${isDyslexiaMode ? 'bg-amber-100 text-amber-900 dark:bg-amber-800 dark:text-amber-100' : ''}`}
          >
            {isDyslexiaMode ? <BookOpen className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDyslexiaMode ? t('common.disable') : t('common.enable')} {t('common.dyslexia')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DyslexiaToggle;
