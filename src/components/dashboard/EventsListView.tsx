import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
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
  draft: { label: 'organizer.events.status.draft', color: 'bg-gray-500' },
  scheduled: { label: 'organizer.events.status.scheduled', color: 'bg-blue-500' },
  active: { label: 'organizer.events.status.active', color: 'bg-green-500' },
  ended: { label: 'organizer.events.status.ended', color: 'bg-orange-500' },
  archived: { label: 'organizer.events.status.archived', color: 'bg-gray-400' },
};

const EventsListView = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
        .select('*')
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
      toast.success(t('organizer.events.updated'));
    },
    onError: () => {
      toast.error(t('organizer.events.updateError'));
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
      toast.success(t('organizer.events.deleted'));
      setDeleteEventId(null);
    },
    onError: () => {
      toast.error(t('organizer.events.deleteError'));
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
    return <div className="text-center py-8">{t('organizer.events.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('organizer.events.totalEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('organizer.events.activeEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('organizer.events.scheduledEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.scheduled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('organizer.events.myEvents')}</CardTitle>
          <CardDescription>{t('organizer.events.manageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('organizer.events.searchPlaceholder')}
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
              <option value="all">{t('organizer.events.allStatuses')}</option>
              <option value="draft">{t('organizer.events.status.draft')}</option>
              <option value="scheduled">{t('organizer.events.status.scheduled')}</option>
              <option value="active">{t('organizer.events.status.active')}</option>
              <option value="ended">{t('organizer.events.status.ended')}</option>
              <option value="archived">{t('organizer.events.status.archived')}</option>
            </select>
          </div>

          {/* Events Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('organizer.events.table.status')}</TableHead>
                  <TableHead>{t('organizer.events.table.title')}</TableHead>
                  <TableHead>{t('organizer.events.table.date')}</TableHead>
                  <TableHead>{t('organizer.events.table.languages')}</TableHead>
                  <TableHead>{t('organizer.events.table.participants')}</TableHead>
                  <TableHead className="text-right">{t('organizer.events.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        <div className="space-y-1">
                          <p className="text-muted-foreground font-medium">
                            {events?.length === 0 
                              ? "Aucun événement pour le moment."
                              : t('organizer.events.noEvents')
                            }
                          </p>
                          {events?.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Cliquez sur <span className="font-semibold">+ Créer</span> pour lancer votre première session Glot
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge className={statusConfig[event.status].color}>
                          {t(statusConfig[event.status].label)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {event.scheduled_at 
                            ? new Date(event.scheduled_at).toLocaleDateString('fr-FR')
                            : t('organizer.events.notScheduled')
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
                              {t('organizer.events.action.viewQR')}
                            </DropdownMenuItem>
                            {event.status === 'scheduled' && (
                              <DropdownMenuItem 
                                onClick={() => updateEventMutation.mutate({ 
                                  id: event.id, 
                                  updates: { status: 'active', started_at: new Date().toISOString() } 
                                })}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {t('organizer.events.action.start')}
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
                                {t('organizer.events.action.end')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => updateEventMutation.mutate({ 
                                id: event.id, 
                                updates: { status: 'archived' } 
                              })}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              {t('organizer.events.action.archive')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteEventId(event.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('organizer.events.action.delete')}
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
            <AlertDialogTitle>{t('organizer.events.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('organizer.events.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('organizer.events.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && deleteEventMutation.mutate(deleteEventId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('organizer.events.confirmDelete')}
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
