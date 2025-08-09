import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award,
  Zap
} from 'lucide-react';

interface StatsData {
  totalChats: number;
  totalMessages: number;
  averagePerDay: number;
  streakDays: number;
  favoriteTopics: string[];
  thisWeekChats: number;
}

export const ChatStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalChats: 0,
    totalMessages: 0,
    averagePerDay: 0,
    streakDays: 0,
    favoriteTopics: [],
    thisWeekChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get total sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, created_at, title')
        .eq('user_id', user?.id);

      if (sessionsError) throw sessionsError;

      // Get total messages
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, created_at, session_id')
        .in('session_id', sessions?.map(s => s.id) || []);

      if (messagesError) throw messagesError;

      // Calculate stats
      const totalChats = sessions?.length || 0;
      const totalMessages = messages?.length || 0;
      
      // Calculate this week's chats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekChats = sessions?.filter(s => 
        new Date(s.created_at) >= oneWeekAgo
      ).length || 0;

      // Calculate average per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentChats = sessions?.filter(s => 
        new Date(s.created_at) >= thirtyDaysAgo
      ).length || 0;
      const averagePerDay = Math.round((recentChats / 30) * 10) / 10;

      // Simple streak calculation (consecutive days with chats)
      const streakDays = calculateStreak(sessions || []);

      // Extract topics from titles (simple keyword extraction)
      const favoriteTopics = extractTopics(sessions?.map(s => s.title) || []);

      setStats({
        totalChats,
        totalMessages,
        averagePerDay,
        streakDays,
        favoriteTopics,
        thisWeekChats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
    const dates = sessions
      .map(s => new Date(s.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (dates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const extractTopics = (titles: string[]) => {
    const words = titles
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['chat', 'conversation', 'with', 'about', 'help', 'question'].includes(word));
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChats}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisWeekChats} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Total exchanges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePerDay}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.favoriteTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Favorite Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.favoriteTopics.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};