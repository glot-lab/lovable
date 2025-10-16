import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  MoreVertical, 
  QrCode, 
  Edit, 
  Copy, 
  Play, 
  Square, 
  Archive, 
  Trash2,
  Calendar,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { EventShareModal } from '@/components/dashboard/EventShareModal';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventStatus = Database['public']['Enums']['event_status'];

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-500' },
  scheduled: { label: 'Programmé', color: 'bg-blue-500' },
  active: { label: 'Actif', color: 'bg-green-500' },
  ended: { label: 'Terminé', color: 'bg-orange-500' },
  archived: { label: 'Archivé', color: 'bg-gray-400' },
};

const EventsListView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [shareEvent, setShareEvent] = useState<Event | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants(count)
        `)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Événement mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Événement supprimé');
      setDeleteEventId(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: events?.length || 0,
    active: events?.filter(e => e.status === 'active').length || 0,
    scheduled: events?.filter(e => e.status === 'scheduled').length || 0,
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Événements Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Programmés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Événements</CardTitle>
          <CardDescription>Gérez tous vos événements de traduction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="scheduled">Programmé</option>
              <option value="active">Actif</option>
              <option value="ended">Terminé</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          {/* Events Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Langues</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun événement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge className={statusConfig[event.status].color}>
                          {statusConfig[event.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {event.scheduled_at 
                            ? new Date(event.scheduled_at).toLocaleDateString('fr-FR')
                            : 'Non programmé'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {event.source_language} → {event.target_languages.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          0
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShareEvent(event)}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Voir QR Code
                            </DropdownMenuItem>
                            {event.status === 'scheduled' && (
                              <DropdownMenuItem 
                                onClick={() => updateEventMutation.mutate({ 
                                  id: event.id, 
                                  updates: { status: 'active', started_at: new Date().toISOString() } 
                                })}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Démarrer
                              </DropdownMenuItem>
                            )}
                            {event.status === 'active' && (
                              <DropdownMenuItem 
                                onClick={() => updateEventMutation.mutate({ 
                                  id: event.id, 
                                  updates: { status: 'ended', ended_at: new Date().toISOString() } 
                                })}
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Terminer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => updateEventMutation.mutate({ 
                                id: event.id, 
                                updates: { status: 'archived' } 
                              })}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archiver
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteEventId(event.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les participants et données associées seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && deleteEventMutation.mutate(deleteEventId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Modal */}
      {shareEvent && (
        <EventShareModal
          event={shareEvent}
          open={!!shareEvent}
          onClose={() => setShareEvent(null)}
        />
      )}
    </div>
  );
};

export default EventsListView;
