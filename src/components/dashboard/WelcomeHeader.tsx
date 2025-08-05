import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Calendar, DollarSign, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    };

    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;

      try {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (data?.first_name) {
          setFirstName(data.first_name);
        } else {
          // Fallback to auth metadata
          setFirstName(user.user_metadata?.first_name || 'Student');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        setFirstName(user.user_metadata?.first_name || 'Student');
      }
    };

    fetchUserName();
  }, [user]);

  const quickSuggestions = [
    {
      icon: Calendar,
      title: "Academic Calendar",
      query: "What are the important academic dates this semester?",
      color: "text-blue-600"
    },
    {
      icon: DollarSign,
      title: "Fee Payment",
      query: "When is the deadline for fee payment?",
      color: "text-green-600"
    },
    {
      icon: FileText,
      title: "Check Results",
      query: "How can I check my examination results?",
      color: "text-purple-600"
    },
    {
      icon: BookOpen,
      title: "Course Registration",
      query: "How do I register for courses this semester?",
      color: "text-orange-600"
    }
  ];

  const handleSuggestionClick = (query: string) => {
    const chatElement = document.querySelector('[data-chat-interface]');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-h-screen overflow-hidden px-4">
      <div className="text-center animate-fade-in max-w-4xl w-full">
        <div className="relative inline-block mb-6 animate-scale-in">
          <div className="bg-primary rounded-full p-6 animate-pulse">
            <GraduationCap className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 bg-secondary rounded-full w-6 h-6 animate-bounce"></div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slide-in-right">
          <span className="inline-block animate-fade-in" style={{animationDelay: '0.2s'}}>
            {greeting}
          </span>
          <span className="inline-block animate-fade-in" style={{animationDelay: '0.4s'}}>
            , {firstName}!
          </span>
          <span className="inline-block animate-fade-in" style={{animationDelay: '0.6s'}}>
            👋
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{animationDelay: '0.8s'}}>
          How can I assist you with your academic needs today?
        </p>

        <div className="mb-6 animate-scale-in" style={{animationDelay: '1s'}}>
          <div className="bg-primary/20 px-4 py-2 rounded-full inline-block mb-6">
            <span className="font-medium text-primary">CKT-UTAS AI Assistant</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '1.2s'}}>
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-accent/50 transition-colors"
                onClick={() => handleSuggestionClick(suggestion.query)}
              >
                <suggestion.icon className={`h-5 w-5 ${suggestion.color}`} />
                <span className="text-xs font-medium text-center">{suggestion.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};