import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Languages, BarChart3, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLanguageByCode } from '@/utils/languages';

interface EventMonitorViewProps {
  eventData: any;
  onBack: () => void;
  onNewEvent: () => void;
}

const EventMonitorView: React.FC<EventMonitorViewProps> = ({ 
  eventData, 
  onBack, 
  onNewEvent 
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const openSpeakerInterface = () => {
    navigate('/speaker');
  };

  // Mock data for demonstration
  const mockStats = {
    connectedParticipants: 127,
    languageBreakdown: [
      { code: 'en', count: 45 },
      { code: 'es', count: 32 },
      { code: 'de', count: 28 },
      { code: 'it', count: 15 },
      { code: 'pt', count: 7 }
    ],
    averageLatency: '1.2s',
    audioStability: '98.7%'
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <div className="flex gap-2">
          <Badge className="bg-glot-green-subtle text-glot-green border-glot-green/30 animate-pulse">
            {t('listener.live')}
          </Badge>
          <Button 
            onClick={openSpeakerInterface}
            className="glot-button hover-lift flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            {t('speaker.goLive')}
          </Button>
          <Button onClick={onNewEvent} variant="outline">
            {t('organizer.workflow.backToCreate')}
          </Button>
        </div>
      </div>

      {/* Event Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{eventData.title}</CardTitle>
              {eventData.date && (
                <p className="text-muted-foreground mt-1">
                  {new Date(eventData.date).toLocaleString()}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-sm">
              {eventData.eventCode}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-lift border-glot-green/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('organizer.workflow.connectedParticipants')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-glot-green mb-1">
              {mockStats.connectedParticipants}
            </div>
            <p className="text-xs text-muted-foreground">{t('organizer.connected')}</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-glot-green/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('organizer.averageLatencyTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-glot-green mb-1">
              {mockStats.averageLatency}
            </div>
            <p className="text-xs text-muted-foreground">{t('common.excellent')}</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-glot-green/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {t('organizer.audioStability')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-glot-green mb-1">
              {mockStats.audioStability}
            </div>
            <p className="text-xs text-muted-foreground">{t('common.stable')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Language Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t('organizer.workflow.languageBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStats.languageBreakdown.map((lang) => {
              const languageData = getLanguageByCode(lang.code);
              const percentage = Math.round((lang.count / mockStats.connectedParticipants) * 100);
              
              return languageData ? (
                <div key={lang.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{languageData.flag}</span>
                    <div>
                      <p className="font-medium">{languageData.nativeName}</p>
                      <p className="text-sm text-muted-foreground">{languageData.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{lang.count}</p>
                    <p className="text-sm text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Settings Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>{t('organizer.workflow.eventSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">{t('organizer.workflow.sourceLanguage')}:</p>
              <p className="text-muted-foreground">{eventData.sourceLanguage?.toUpperCase()}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('organizer.workflow.eventType')}:</p>
              <p className="text-muted-foreground">
                {eventData.eventType === 'public' 
                  ? t('organizer.workflow.eventTypePublic') 
                  : t('organizer.workflow.eventTypePrivate')
                }
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('organizer.workflow.targetLanguages')}:</p>
              <p className="text-muted-foreground">
                {eventData.targetLanguages?.length} {t('organizer.languages').toLowerCase()}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">{t('organizer.workflow.eventCode')}:</p>
              <p className="text-muted-foreground font-mono">{eventData.eventCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventMonitorView;