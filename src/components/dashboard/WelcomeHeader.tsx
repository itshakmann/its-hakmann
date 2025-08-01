import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap } from 'lucide-react';

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
        const { data, error } = await supabase
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

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary rounded-full p-4 animate-pulse">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 bg-secondary rounded-full w-4 h-4 animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {greeting}, {firstName}!
              </h1>
              <p className="text-muted-foreground">
                How can I assist you with your academic needs today?
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="bg-primary/20 px-3 py-1 rounded-full">
              <span className="font-medium">CKT-UTAS AI Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};