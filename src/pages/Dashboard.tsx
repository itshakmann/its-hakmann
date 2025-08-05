import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { AcademicSuggestions } from '@/components/dashboard/AcademicSuggestions';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          autoSaveHistory={autoSaveHistory}
          setAutoSaveHistory={setAutoSaveHistory}
        />
        
        <main className="flex-1 flex flex-col relative">
          {showWelcome && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/95 backdrop-blur-sm pointer-events-none">
              <div className="pointer-events-auto w-full">
                <WelcomeHeader />
              </div>
            </div>
          )}
          
          <div className="flex-1 d-flex flex-column container-fluid p-3">
            <div className="row h-100">
              <div className="col-12 h-100">
                <ChatInterface 
                  autoSaveHistory={autoSaveHistory}
                  onStartTyping={() => setShowWelcome(false)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;