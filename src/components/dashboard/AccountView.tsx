import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AccountView = () => {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: events } = await supabase
        .from('events')
        .select('id, created_at')
        .eq('organizer_id', user.id);
      
      const { count: totalParticipants } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .in('event_id', events?.map(e => e.id) || []);
      
      return {
        totalEvents: events?.length || 0,
        totalParticipants: totalParticipants || 0,
        memberSince: events?.[0]?.created_at,
      };
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Événements créés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalEvents || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalParticipants || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Membre depuis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {profile?.created_at 
                ? format(new Date(profile.created_at), 'MMM yyyy', { locale: fr })
                : '-'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Gérez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full-name">Nom complet</Label>
            <Input
              id="full-name"
              value={profile?.full_name || ''}
              placeholder="Votre nom complet"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              value={profile?.company_name || ''}
              placeholder="Nom de votre entreprise"
            />
          </div>

          <Button className="w-full sm:w-auto" disabled>
            Mettre à jour le profil (bientôt disponible)
          </Button>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications email</p>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications pour les événements
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Bientôt disponible
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Changer le mot de passe</p>
              <p className="text-sm text-muted-foreground">
                Modifier votre mot de passe de connexion
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Bientôt disponible
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountView;
