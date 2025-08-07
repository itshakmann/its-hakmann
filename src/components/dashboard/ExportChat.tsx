import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  FileJson,
  Share
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ExportChatProps {
  messages: Message[];
  sessionTitle?: string;
}

export const ExportChat: React.FC<ExportChatProps> = ({
  messages,
  sessionTitle = 'Chat Session'
}) => {
  const { toast } = useToast();

  const exportAsText = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const header = `${sessionTitle}\nExported: ${format(new Date(), 'PPpp')}\n${'='.repeat(50)}\n\n`;
    
    const content = messages.map(message => {
      const time = format(message.timestamp, 'HH:mm');
      const sender = message.sender === 'user' ? 'You' : 'Assistant';
      return `[${time}] ${sender}:\n${message.content}\n`;
    }).join('\n');

    const fullContent = header + content;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Chat exported as text file",
    });
  };

  const exportAsJSON = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const exportData = {
      title: sessionTitle,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(message => ({
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp.toISOString(),
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Chat exported as JSON file",
    });
  };

  const shareChat = async () => {
    const content = messages.map(message => {
      const sender = message.sender === 'user' ? 'You' : 'Assistant';
      return `${sender}: ${message.content}`;
    }).join('\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionTitle,
          text: content,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied!",
          description: "Chat conversation copied to clipboard",
        });
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied!",
          description: "Chat conversation copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Unable to share or copy conversation",
          variant: "destructive",
        });
      }
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Chat
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareChat}>
          <Share className="h-4 w-4 mr-2" />
          Share conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};