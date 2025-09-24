import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, QrCode, ArrowLeft, Mic } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EventShareViewProps {
  eventData: any;
  onBack: () => void;
  onContinueToMonitor: () => void;
}

const EventShareView: React.FC<EventShareViewProps> = ({ 
  eventData, 
  onBack, 
  onContinueToMonitor 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le lien a été copié dans le presse-papier",
    });
  };

  const downloadQR = () => {
    // In a real app, this would generate and download a QR code
    toast({
      title: "QR Code",
      description: "Fonctionnalité de téléchargement en cours de développement",
    });
  };

  const handleGoLive = () => {
    // Navigate to speaker interface with event data pre-filled
    navigate('/speaker', { 
      state: { 
        eventData,
        autoLogin: true 
      } 
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('organizer.workflow.backToCreate')}
        </Button>
        <Badge className="bg-glot-green-subtle text-glot-green border-glot-green/30">
          {t('organizer.workflow.accessGenerated')}
        </Badge>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{eventData.title}</CardTitle>
          {eventData.date && (
            <p className="text-muted-foreground">
              {new Date(eventData.date).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-1">{t('organizer.workflow.sourceLanguage')}:</p>
              <p className="text-sm text-muted-foreground">{eventData.sourceLanguage?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">{t('organizer.workflow.targetLanguages')}:</p>
              <p className="text-sm text-muted-foreground">
                {eventData.targetLanguages?.map((lang: string) => lang.toUpperCase()).join(', ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t('organizer.workflow.qrCodeTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {/* QR Code Placeholder */}
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center space-y-2">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QR Code</p>
                <p className="text-xs text-muted-foreground">{eventData.eventCode}</p>
              </div>
            </div>
            <Button 
              onClick={downloadQR}
              variant="outline" 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('organizer.workflow.downloadQR')}
            </Button>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle>{t('organizer.workflow.shareableLink')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Event Code */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {t('organizer.workflow.eventCode')}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                  {eventData.eventCode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(eventData.eventCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {t('organizer.workflow.shareableLink')}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg text-sm break-all">
                  {eventData.shareLink}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(eventData.shareLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={() => copyToClipboard(eventData.shareLink)}
              className="w-full glot-button hover-lift"
            >
              <Copy className="h-4 w-4 mr-2" />
              {t('organizer.workflow.copyLink')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleGoLive}
          className="glot-button hover-lift px-8 py-3 flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          {t('speaker.goLive')}
        </Button>
        <Button 
          onClick={onContinueToMonitor}
          variant="outline"
          className="px-8 py-3"
        >
          {t('organizer.workflow.monitor')} →
        </Button>
      </div>
    </div>
  );
};

export default EventShareView;