import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  User, 
  LogOut, 
  GraduationCap,
  History,
  MessageSquarePlus,
  Clock
} from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { SessionHistory } from './SessionHistory';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface DashboardSidebarProps {
  autoSaveHistory: boolean;
  setAutoSaveHistory: (value: boolean) => void;
  onSessionSelect?: (sessionId: string) => void;
  currentSessionId?: string;
  onNewChat?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  autoSaveHistory,
  setAutoSaveHistory,
  onSessionSelect,
  currentSessionId,
  onNewChat
}) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Chat',
      icon: MessageSquare,
      url: '/dashboard',
    },
    {
      title: 'Profile',
      icon: User,
      url: '/profile',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <TooltipProvider>
      <Sidebar className="border-r border-border">
        <SidebarHeader className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">CKT-UTAS</h2>
              <p className="text-xs text-muted-foreground">Student Assistant</p>
            </div>
          </div>
        </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.title === 'Chat' ? 'Start a conversation with the AI assistant' : 'View and edit your profile settings'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {onSessionSelect && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Chat History
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SessionHistory 
                onSessionSelect={onSessionSelect}
                currentSessionId={currentSessionId}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
              <div className="px-3 py-2 space-y-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-save" className="text-sm flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Auto-Save History
                      </Label>
                      <Switch
                        id="auto-save"
                        checked={autoSaveHistory}
                        onCheckedChange={setAutoSaveHistory}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Automatically save your chat conversations</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <FeedbackModal 
                        trigger={
                          <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                            <MessageSquarePlus className="h-4 w-4 mr-2" />
                            Give Feedback
                          </Button>
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send feedback about your experience</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Theme</Label>
                  <ThemeToggle />
                </div>
              </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

        <SidebarFooter className="border-t border-border p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
};