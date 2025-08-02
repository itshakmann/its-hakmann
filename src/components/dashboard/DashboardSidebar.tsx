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
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  User, 
  LogOut, 
  GraduationCap,
  History,
  MessageSquarePlus
} from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

interface DashboardSidebarProps {
  autoSaveHistory: boolean;
  setAutoSaveHistory: (value: boolean) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  autoSaveHistory,
  setAutoSaveHistory
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
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-3">
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
              
              <FeedbackModal 
                trigger={
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Give Feedback
                  </Button>
                }
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};