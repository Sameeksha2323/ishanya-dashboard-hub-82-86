import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticateUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Mail, Users, ArrowLeft } from 'lucide-react';
import { AccessibilityMenu } from '@/components/ui/AccessibilityMenu';
import { useLanguage } from '@/components/ui/LanguageProvider';
import DyslexiaToggle from '@/components/ui/DyslexiaToggle';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
  role: z.string({ required_error: "Please select a role" })
    .refine(val => ['administrator', 'hr', 'educator', 'parent'].includes(val), {
      message: "Invalid role selected"
    })
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: ''
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const result = await authenticateUser(data.email, data.password, data.role);
      
      if (result.success) {
        toast.success("Login successful", {
          duration: 3000, // Auto-dismiss after 3 seconds
        });
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect based on role
        switch(result.user.role) {
          case 'administrator':
            navigate('/admin');
            break;
          case 'hr':
            navigate('/hr');
            break;
          case 'educator':
            navigate('/teacher');
            break;
          case 'parent':
            navigate('/parent');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error(result.message || "Invalid credentials", {
          duration: 3000, // Auto-dismiss after 3 seconds
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login", {
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6 relative">
          <div className="absolute left-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="text-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/a6017f5f-7947-49ad-a9ed-0bc0e588a9b0.png" 
                alt="Ishanya Logo"
                className="h-16 mx-auto"
              />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Journey to Inclusion</p>
          </div>
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-ishanya-green dark:border-ishanya-green/70 dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <div className="flex justify-end space-x-2 absolute right-4 top-4">
              <DyslexiaToggle />
              <AccessibilityMenu />
            </div>
            <CardTitle className="text-xl text-center font-bold text-gray-800 dark:text-gray-100 mt-8">{t('login.title')}</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              {t('login.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">{t('login.email')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <Input placeholder="email@example.com" className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">{t('login.password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <Input 
                            type="password" 
                            placeholder="******" 
                            className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" 
                            {...field} 
                            showPasswordToggle
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">{t('login.role')}</FormLabel>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="administrator" className="dark:text-gray-100">Administrator</SelectItem>
                            <SelectItem value="hr" className="dark:text-gray-100">HR</SelectItem>
                            <SelectItem value="educator" className="dark:text-gray-100">Educator</SelectItem>
                            <SelectItem value="parent" className="dark:text-gray-100">Parent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-ishanya-green hover:bg-ishanya-green/90 text-white dark:bg-ishanya-green/80 dark:hover:bg-ishanya-green" 
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('login.button')}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center dark:text-gray-300">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('login.contact')}
            </p>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Ishanya Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
