import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Plus, BarChart3, User } from 'lucide-react';
import EventsListView from '@/components/dashboard/EventsListView';
import CreateEventView from '@/components/dashboard/CreateEventView';
import AccountView from '@/components/dashboard/AccountView';
import InterfaceLanguageSelector from '@/components/InterfaceLanguageSelector';

const OrganizerDashboard = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('events');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    // signOut est maintenant instantané, la navigation se fera automatiquement via ProtectedRoute
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Title and Description */}
            <div className="flex flex-col gap-1">
              <h1 className="text-xl md:text-2xl font-bold">{t('organizer.dashboardTitle')}</h1>
              <span className="text-sm text-muted-foreground">
                {t('organizer.dashboardSubtitle')}
              </span>
            </div>
            
            {/* Language Selector */}
            <InterfaceLanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="events" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
              <Calendar className="h-4 w-4 flex-shrink-0 hidden sm:inline-block" />
              <span className="hidden sm:inline">{t('organizer.tabs.myEvents')}</span>
              <span className="sm:hidden text-xs">{t('organizer.tabs.events')}</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
              <Plus className="h-4 w-4 flex-shrink-0 hidden sm:inline-block" />
              <span className="text-xs sm:text-sm">{t('organizer.tabs.create')}</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
              <BarChart3 className="h-4 w-4 flex-shrink-0 hidden sm:inline-block" />
              <span className="text-xs sm:text-sm">{t('organizer.tabs.stats')}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
              <User className="h-4 w-4 flex-shrink-0 hidden sm:inline-block" />
              <span className="hidden sm:inline">{t('organizer.tabs.account')}</span>
              <span className="sm:hidden text-xs">{t('organizer.tabs.account')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <EventsListView />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <CreateEventView onSuccess={() => setActiveTab('events')} />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Monitoring en temps réel
              </h3>
              <p className="text-muted-foreground">
                Cette fonctionnalité sera disponible dans le Sprint 2
              </p>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <AccountView />
          </TabsContent>
        </Tabs>

        {/* Logout Button at Bottom */}
        <div className="mt-12 pb-8 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="gap-2 w-full max-w-xs"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Déconnexion...' : t('organizer.logout')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
