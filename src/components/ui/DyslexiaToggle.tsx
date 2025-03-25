
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';

export const DyslexiaToggle = () => {
  const { t } = useLanguage();
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    // Check if there's a saved preference in localStorage
    const savedMode = localStorage.getItem('dyslexiaMode');
    return savedMode === 'true';
  });

  // Apply dyslexia class to body when component mounts and when mode changes
  useEffect(() => {
    const applyDyslexiaMode = () => {
      const root = document.documentElement;
      
      if (isDyslexiaMode) {
        // Add dyslexia-friendly styles
        document.body.classList.add('dyslexia-mode');
        root.classList.add('dyslexia-mode');
        
        // Add to stylesheet for smooth transitions and better visual experience
        const style = document.createElement('style');
        style.id = 'dyslexia-styles';
        style.innerHTML = `
          body.dyslexia-mode {
            font-family: 'OpenDyslexic', 'Comic Sans MS', Arial, sans-serif;
            line-height: 1.6;
            letter-spacing: 0.05em;
            word-spacing: 0.15em;
          }
          .dyslexia-mode p, .dyslexia-mode h1, .dyslexia-mode h2, .dyslexia-mode h3, 
          .dyslexia-mode h4, .dyslexia-mode label, .dyslexia-mode span,
          .dyslexia-mode button, .dyslexia-mode a, .dyslexia-mode input, 
          .dyslexia-mode select, .dyslexia-mode textarea {
            font-family: 'OpenDyslexic', 'Comic Sans MS', Arial, sans-serif !important;
            line-height: 1.6 !important;
            letter-spacing: 0.05em !important;
            word-spacing: 0.15em !important;
            transition: all 0.3s ease-in-out;
          }
          .dyslexia-mode p, .dyslexia-mode label, .dyslexia-mode span {
            max-width: 70ch;
            line-height: 1.8 !important;
          }
        `;
        document.head.appendChild(style);
        
        // Set scroll behavior to smooth for better experience
        document.documentElement.style.scrollBehavior = 'smooth';
      } else {
        // Remove dyslexia-friendly styles
        document.body.classList.remove('dyslexia-mode');
        root.classList.remove('dyslexia-mode');
        const dyslexiaStyles = document.getElementById('dyslexia-styles');
        if (dyslexiaStyles) {
          dyslexiaStyles.remove();
        }
        
        // Reset scroll behavior
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
    
    // Apply with a slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      applyDyslexiaMode();
    }, 50);
    
    // Save preference to localStorage
    localStorage.setItem('dyslexiaMode', isDyslexiaMode.toString());
    
    return () => clearTimeout(timer);
  }, [isDyslexiaMode]);

  const toggleDyslexiaMode = () => {
    setIsDyslexiaMode(!isDyslexiaMode);
    toast.success(
      !isDyslexiaMode 
        ? t('accessibility.dyslexia_enabled') || 'Dyslexia-friendly mode enabled' 
        : t('accessibility.dyslexia_disabled') || 'Dyslexia-friendly mode disabled',
      { duration: 2000 }
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline"
            size="icon"
            onClick={toggleDyslexiaMode}
            className={`rounded-full transition-all duration-300 ${
              isDyslexiaMode 
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-800 dark:text-amber-100' 
                : ''
            }`}
            aria-label={isDyslexiaMode ? t('common.disable') : t('common.enable') + ' ' + t('common.dyslexia')}
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
