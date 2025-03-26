
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DyslexiaToggle from '@/components/ui/DyslexiaToggle';

type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
};

const DiscussionRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getCurrentUser();
  const { toast } = useToast();
  
  // Function to fetch latest messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages...');
      
      const { data, error } = await supabase
        .from('discussion_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
        
      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load discussion messages',
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        console.log('Fetched messages:', data);
        setMessages(data);
      } else {
        console.log('No messages found');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch of messages
  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('discussion_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_messages',
        },
        (payload) => {
          // Add new message to the list
          const newMsg = payload.new as Message;
          console.log('New message received via realtime:', newMsg);
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
      
    // Cleanup subscription
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Scrolling to bottom');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Send a new message
  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) {
      console.log('Cannot send message: User or message is empty', { user, message: newMessage });
      return;
    }
    
    try {
      setIsSending(true);
      
      const messageData = {
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
        message: newMessage.trim(),
      };
      
      console.log('Sending message:', messageData);
      
      const { error, data } = await supabase
        .from('discussion_messages')
        .insert(messageData)
        .select();
        
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: `Failed to send message: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Message sent successfully:', data);
      
      // Clear input after successful send
      setNewMessage('');
      
      // Fetch messages again to ensure we have the latest
      // This is a fallback in case the realtime subscription misses something
      fetchMessages();
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Get avatar fallback initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get color based on user role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-700';
      case 'hr':
        return 'bg-purple-100 text-purple-700';
      case 'teacher':
        return 'bg-blue-100 text-blue-700';
      case 'parent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Helper function to format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Discussion Room</CardTitle>
        <DyslexiaToggle />
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(70vh-8rem)] px-4">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400 dyslexic-spacing">
                No messages yet. Be the first to start the discussion!
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender_id !== user?.id && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={getRoleColor(msg.sender_role)}>
                          {getInitials(msg.sender_name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.sender_id !== user?.id && (
                        <div className="font-semibold mb-2 flex items-center gap-2">
                          {msg.sender_name}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(msg.sender_role)}`}
                          >
                            {msg.sender_role}
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap dyslexic-spacing">{msg.message}</div>
                      <div
                        className={`text-xs mt-2 ${
                          msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                    
                    {msg.sender_id === user?.id && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={getRoleColor(user.role)}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <div className="flex w-full gap-2">
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] flex-grow text-base"
            disabled={isSending || !user}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !user || isSending}
            className="self-end"
            size="icon"
          >
            {isSending ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiscussionRoom;
