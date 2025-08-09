import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, ThumbsUp, ThumbsDown, Plus, Keyboard, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { findBestFAQMatch, FAQEntry } from '@/utils/fuzzyMatch';
import { MessageActions } from './MessageActions';
import { ExportChat } from './ExportChat';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  feedback?: 'up' | 'down' | null;
}

interface ChatInterfaceProps {
  autoSaveHistory: boolean;
  onStartTyping?: () => void;
  sessionId?: string;
  onNewSession?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  autoSaveHistory,
  onStartTyping,
  sessionId,
  onNewSession 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: () => {
      if (onNewSession) {
        onNewSession();
      } else {
        handleNewChat();
      }
    },
    onFocusInput: () => inputRef.current?.focus(),
    onClearChat: () => handleClearChat(),
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      loadSessionMessages(sessionId);
      setCurrentSessionId(sessionId);
    } else if (autoSaveHistory && user && !currentSessionId) {
      createNewSession();
    }
  }, [autoSaveHistory, user, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender as 'user' | 'bot',
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    if (autoSaveHistory && user) {
      createNewSession();
    }
    toast({
      title: "New Chat",
      description: "Started a new conversation",
    });
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared",
    });
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `Chat Session ${new Date().toLocaleString()}`
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const saveMessage = async (content: string, sender: 'user' | 'bot') => {
    if (!autoSaveHistory || !currentSessionId) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          content,
          sender,
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const findBestMatch = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('question, answer');

      if (error) throw error;

      if (!data || data.length === 0) {
        return "I'm sorry, but I don't have any information available in my knowledge base yet. Please contact the administration for assistance.";
      }

      // Use fuzzy matching to find the best match
      const matchResult = findBestFAQMatch(userMessage, data as FAQEntry[], 70);

      if (matchResult) {
        return matchResult.faq.answer || "No answer available for this question.";
      }

      // Fallback response when no good match is found
      return "I couldn't find a specific answer to your question in my knowledge base. Here are some common topics I can help with:\n\n• Academic deadlines and fees\n• Course information\n• Examination and results\n• Registration procedures\n• General university policies\n\nPlease try rephrasing your question or contact the administration directly for more specific information.";
    } catch (error) {
      console.error('Error searching FAQ:', error);
      return "I'm experiencing technical difficulties. Please try again later or contact the administration for assistance.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message
    await saveMessage(userMessage.content, 'user');

    // Get bot response
    const botResponse = await findBestMatch(userMessage.content);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);

    // Save bot message
    await saveMessage(botMessage.content, 'bot');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    setFeedbackMessage('Thanks for your feedback!');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="h-100 d-flex flex-column" data-chat-interface>
      <Card className="h-100 d-flex flex-column shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-medium">CKT-UTAS Assistant</span>
            <span className="text-xs text-muted-foreground">
              {messages.length > 0 ? `${messages.length} messages` : 'Ready to help'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ExportChat 
              messages={messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp
              }))} 
              sessionTitle={`Chat Session ${format(new Date(), 'PPp')}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="h-8 w-8"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 h-100 d-flex flex-column">
          {/* Messages Area */}
          <div className="flex-1 overflow-auto mb-4" style={{ minHeight: '400px' }}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-5">
                <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium mb-2">CKT-UTAS AI Assistant</p>
                <p>Ask me anything about university procedures, deadlines, courses, or academic policies!</p>
              </div>
            )}
          
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div className="group d-flex gap-3 mb-4" style={{ alignItems: 'flex-start' }}>
                  {message.sender === 'bot' && (
                    <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{minWidth: '32px', height: '32px'}}>
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted text-foreground'
                      }`} style={{ maxWidth: message.sender === 'user' ? '70%' : '85%', marginLeft: message.sender === 'user' ? 'auto' : '0' }}>
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className="text-xs mt-2 opacity-70">
                          {format(message.timestamp, 'HH:mm')}
                        </div>
                      </div>
                      
                      {message.sender === 'bot' && (
                        <MessageActions 
                          message={message.content}
                          messageId={message.id}
                        />
                      )}
                    </div>

                    {/* Feedback buttons for bot messages */}
                    {message.sender === 'bot' && (
                      <div className="d-flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(message.id, 'up')}
                          className={`p-1 ${message.feedback === 'up' ? 'bg-green-100 text-green-600' : ''}`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(message.id, 'down')}
                          className={`p-1 ${message.feedback === 'down' ? 'bg-red-100 text-red-600' : ''}`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{minWidth: '32px', height: '32px'}}>
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          
            {isLoading && (
              <div className="d-flex gap-3 justify-content-start mb-4">
                <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{minWidth: '32px', height: '32px'}}>
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="d-flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-circle animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground rounded-circle animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-foreground rounded-circle animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className="alert alert-success text-center py-2 mb-3" role="alert">
              {feedbackMessage}
            </div>
          )}

          {/* Fixed Input Area */}
          <div className="border-top pt-3 mt-auto relative z-20 bg-background">
            <div className="d-flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (e.target.value.length === 1 && onStartTyping) {
                    onStartTyping();
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about academic procedures, deadlines, courses..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Keyboard Shortcuts Help */}
            {showShortcuts && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Keyboard Shortcuts</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>⌘/Ctrl + N - New chat</div>
                  <div>⌘/Ctrl + K - Focus input</div>
                  <div>⌘/Ctrl + ⇧ + Del - Clear chat</div>
                  <div>Esc - Focus input</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};