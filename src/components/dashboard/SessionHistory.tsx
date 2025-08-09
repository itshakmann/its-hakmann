import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  MessageSquare, 
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SessionHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  currentSessionId?: string;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  onSessionSelect,
  currentSessionId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Deleted",
        description: "Chat session deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sessions List */}
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No conversations found' : 'No chat history yet'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                  currentSessionId === session.id ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(session.updated_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteSession(session.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};