import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Plus, BarChart3, User } from 'lucide-react';
import EventsListView from '@/components/dashboard/EventsListView';
import CreateEventView from '@/components/dashboard/CreateEventView';
import AccountView from '@/components/dashboard/AccountView';
import InterfaceLanguageSelector from '@/components/InterfaceLanguageSelector';

const OrganizerDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Glot Dashboard</h1>
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <InterfaceLanguageSelector />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mes Événements
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Créer
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mon Compte
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
      </main>
    </div>
  );
};

export default OrganizerDashboard;
