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

  return (
    <div className="text-center">
      <div className="relative inline-block mb-6">
        <div className="bg-primary rounded-full p-8">
          <GraduationCap className="h-16 w-16 text-primary-foreground" />
        </div>
        <div className="absolute -top-2 -right-2 bg-secondary rounded-full w-8 h-8"></div>
      </div>
      
      <h1 className="text-4xl font-bold text-foreground mb-4">
        {greeting}, {firstName}! 👋
      </h1>
      
      <p className="text-xl text-muted-foreground mb-6">
        How can I assist you with your academic needs today?
      </p>
      
      <div className="bg-primary/20 px-4 py-2 rounded-full inline-block">
        <span className="font-medium text-primary">CKT-UTAS AI Assistant</span>
      </div>
    </div>
  );
};