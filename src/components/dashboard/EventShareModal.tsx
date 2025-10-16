import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Download, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

interface EventShareModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
}

export const EventShareModal = ({ event, open, onClose }: EventShareModalProps) => {
  const [showSpeakerKey, setShowSpeakerKey] = useState(false);
  
  const listenerUrl = `${window.location.origin}/listener?code=${event.event_code}`;
  const speakerUrl = `${window.location.origin}/speaker?key=${event.speaker_key}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${event.title}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR Code téléchargé !');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Partager votre événement</DialogTitle>
          <DialogDescription>
            Partagez ces informations avec vos participants et intervenants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-card">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG
                id="qr-code"
                value={listenerUrl}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Code d'accès : <span className="font-mono font-bold text-lg">{event.event_code}</span>
            </p>
            <Button onClick={downloadQR} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger QR Code
            </Button>
          </div>

          {/* Listener Link */}
          <div className="space-y-2">
            <Label>Lien pour les participants (listeners)</Label>
            <div className="flex gap-2">
              <Input value={listenerUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(listenerUrl, 'Lien listener')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Les participants utilisent ce lien pour rejoindre l'événement
            </p>
          </div>

          {/* Speaker Key - Sensitive */}
          <div className="space-y-2 p-4 border border-orange-500/50 rounded-lg bg-orange-500/5">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <Label className="text-orange-600">Clé Speaker (confidentielle)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Cette clé permet de diffuser l'audio. Ne la partagez qu'avec les intervenants autorisés.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type={showSpeakerKey ? 'text' : 'password'}
                value={event.speaker_key}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSpeakerKey(!showSpeakerKey)}
              >
                {showSpeakerKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(event.speaker_key, 'Clé speaker')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => copyToClipboard(speakerUrl, 'Lien speaker')}
              >
                Copier le lien speaker
              </Button>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Terminé
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
