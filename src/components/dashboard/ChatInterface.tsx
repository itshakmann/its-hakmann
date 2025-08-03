import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';

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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ autoSaveHistory, onStartTyping }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (autoSaveHistory && user) {
      createNewSession();
    }
  }, [autoSaveHistory, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
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
      await (supabase as any)
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

      // Simple semantic matching - check if user message contains keywords from FAQ questions
      const userWords = userMessage.toLowerCase().split(' ');
      let bestMatch = null;
      let highestScore = 0;

      for (const faq of data) {
        const questionWords = faq.question.toLowerCase().split(' ');
        let score = 0;

        // Calculate similarity score
        for (const userWord of userWords) {
          if (userWord.length > 3) { // Only consider words longer than 3 characters
            for (const questionWord of questionWords) {
              if (questionWord.includes(userWord) || userWord.includes(questionWord)) {
                score += 1;
              }
            }
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = faq;
        }
      }

      if (bestMatch && highestScore > 0) {
        return bestMatch.answer;
      }

      // Fallback response
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
    <div className="container-fluid h-100 d-flex flex-column">
      <Card className="flex-1 d-flex flex-column h-100">
        <CardContent className="flex-1 d-flex flex-column p-4">
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
                <div className={`d-flex gap-3 ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  {message.sender === 'bot' && (
                    <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{minWidth: '32px', height: '32px'}}>
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className="d-flex flex-column" style={{maxWidth: '80%'}}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="mb-0 white-space-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 mb-0">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
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
          <div className="border-top pt-3 mt-auto">
            <div className="d-flex gap-2">
              <Input
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};