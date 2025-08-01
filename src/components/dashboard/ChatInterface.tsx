import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  autoSaveHistory: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ autoSaveHistory }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
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

  return (
    <Card className="flex-1 flex flex-col h-[600px]">
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium mb-2">CKT-UTAS AI Assistant</p>
              <p>Ask me anything about university procedures, deadlines, courses, or academic policies!</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="bg-primary rounded-full p-2 h-8 w-8 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="bg-secondary rounded-full p-2 h-8 w-8 flex items-center justify-center">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-primary rounded-full p-2 h-8 w-8 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
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
      </CardContent>
    </Card>
  );
};