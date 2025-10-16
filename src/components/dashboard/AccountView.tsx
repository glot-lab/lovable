import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AccountView = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
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
      
      // Only query participants if there are events
      let totalParticipants = 0;
      if (events && events.length > 0) {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .in('event_id', events.map(e => e.id));
        
        totalParticipants = count || 0;
      }
      
      return {
        totalEvents: events?.length || 0,
        totalParticipants,
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
              {t('organizer.account.eventsCreated')}
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
              {t('organizer.account.totalParticipants')}
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
              {t('organizer.account.memberSince')}
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
          <CardTitle>{t('organizer.account.accountInfo')}</CardTitle>
          <CardDescription>
            {t('organizer.account.accountDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('organizer.account.email')}</Label>
            <Input
              id="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full-name">{t('organizer.account.fullName')}</Label>
            <Input
              id="full-name"
              value={profile?.full_name || ''}
              placeholder={t('organizer.account.fullNamePlaceholder')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">{t('organizer.account.company')}</Label>
            <Input
              id="company"
              value={profile?.company_name || ''}
              placeholder={t('organizer.account.companyPlaceholder')}
            />
          </div>

          <Button className="w-full sm:w-auto" disabled>
            {t('organizer.account.updateProfile')}
          </Button>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('organizer.account.settings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('organizer.account.emailNotifications')}</p>
              <p className="text-sm text-muted-foreground">
                {t('organizer.account.emailNotificationsDesc')}
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              {t('organizer.account.comingSoon')}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('organizer.account.changePassword')}</p>
              <p className="text-sm text-muted-foreground">
                {t('organizer.account.changePasswordDesc')}
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              {t('organizer.account.comingSoon')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountView;
