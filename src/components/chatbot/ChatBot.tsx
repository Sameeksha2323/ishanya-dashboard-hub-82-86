import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
};

type ChatBotProps = {
  isOpen: boolean;
  onClose: () => void;
};

type UserAccessLevel = 1 | 2 | 3; // 1: admin, 2: hr, 3: teacher

const ChatBot = ({ isOpen, onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I can help you access information about students, programs, and more. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const user = getCurrentUser();

  // Determine user access level based on role
  const getUserAccessLevel = (): UserAccessLevel => {
    if (!user) return 3; // Default to teacher level if no user found
    
    switch (user.role) {
      case 'administrator':
        return 1;
      case 'hr':
        return 2;
      case 'educator':
        return 3;
      default:
        return 3;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const userAccessLevel = getUserAccessLevel();
      
      const payload = {
        user_query: inputValue.trim(),
        user_access_level: userAccessLevel,
      };

      const response = await fetch('https://chatbot-lbcg.onrender.com/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Format the response data
      let botResponseText = '';
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          botResponseText = 'No results found for your query.';
        } else {
          // Format the array of results into readable text
          botResponseText = data.map((item, index) => {
            // Convert the object to a formatted string
            const formattedItem = Object.entries(item)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            
            return `Result ${index + 1}:\n${formattedItem}`;
          }).join('\n\n');
        }
      } else if (typeof data === 'object') {
        // If it's a single object
        botResponseText = Object.entries(data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      } else {
        // If it's a string or other primitive
        botResponseText = data.toString();
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, there was an error processing your request. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(t('common.error') || 'Error fetching chatbot response');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] max-h-[80vh] z-50 shadow-xl flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-ishanya-yellow/80 dark:bg-ishanya-yellow/80 text-black">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t('chatbot.title') || 'Assistant'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className={message.sender === 'user' ? 'bg-blue-500' : 'bg-ishanya-green'}>
                <AvatarFallback>
                  {message.sender === 'user' ? user?.name.substring(0, 2).toUpperCase() || 'U' : 'AI'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 whitespace-pre-wrap ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <Avatar className="bg-ishanya-green">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-gray-200 dark:bg-gray-700 flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-900 dark:text-gray-100" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-3 border-t bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chatbot.placeholder') || 'Type your question...'}
            className="flex-1 min-h-10 max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatBot;
