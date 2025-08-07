import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Download, 
  MoreHorizontal,
  Share,
  Bookmark 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface MessageActionsProps {
  message: string;
  messageId: string;
  onBookmark?: (messageId: string) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  messageId,
  onBookmark
}) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadMessage = () => {
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${messageId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Message saved to your downloads",
    });
  };

  const shareMessage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CKT-UTAS Assistant Message',
          text: message,
        });
      } catch (err) {
        copyToClipboard(); // Fallback to copy
      }
    } else {
      copyToClipboard(); // Fallback to copy
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareMessage}>
          <Share className="h-4 w-4 mr-2" />
          Share message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadMessage}>
          <Download className="h-4 w-4 mr-2" />
          Download as text
        </DropdownMenuItem>
        {onBookmark && (
          <DropdownMenuItem onClick={() => onBookmark(messageId)}>
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};