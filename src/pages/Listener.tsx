import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, QrCode } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import glotLogoNew from "@/assets/glot-logo-new.png";
import GlotLandingPage from "@/components/GlotLandingPage";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeScanner } from "@/components/QRCodeScanner";

const Listener = () => {
  const { t } = useLanguage();
  const [eventCode, setEventCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [connectionError, setConnectionError] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const availableLanguages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const handleConnect = async () => {
    setConnectionError("");
    if (!eventCode.trim() || !selectedLanguage) {
      setConnectionError(t('listener.invalidEventCode'));
      return;
    }
    
    try {
      // Validate event code securely without exposing speaker_key
      const { data, error } = await supabase.rpc('validate_event_code', {
        _event_code: eventCode.trim().toUpperCase()
      });

      if (error) {
        console.error('Error validating event code:', error);
        setConnectionError(t('listener.invalidEventCode'));
        return;
      }

      if (!data) {
        setConnectionError(t('listener.invalidEventCode'));
        return;
      }

      // Check if selected language is available for this event
      const eventData = data as { target_languages: string[] };
      if (!eventData.target_languages?.includes(selectedLanguage)) {
        setConnectionError(t('listener.languageNotAvailable'));
        return;
      }

      setIsConnected(true);
      setConnectionError('');
    } catch (err) {
      console.error('Unexpected error:', err);
      setConnectionError(t('listener.connectionError'));
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleQRScan = (scannedCode: string) => {
    setEventCode(scannedCode.toUpperCase());
    setShowQRScanner(false);
  };

  // Show landing page first
  if (showLanding) {
    return <GlotLandingPage onJoinEvent={() => setShowLanding(false)} />;
  }

      if (isConnected) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <InterfaceLanguageSelector />
        {/* Header with Glot branding */}
        <div className="border-b bg-card p-4 shadow-subtle">
          <div className="container mx-auto flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">{t('listener.live')}</span>
            </div>
          </div>
        </div>

        {/* Main Audio Interface */}
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-lg space-y-8 animate-slide-up">
            
            {/* Audio Player */}
            <Card className="border-0 shadow-lg hover-lift bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                
                <h2 className="text-2xl font-semibold mb-3 text-foreground">
                  {availableLanguages.find(l => l.code === selectedLanguage)?.name}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">{t('listener.realTimeTranslation')}</p>
                
                <Button 
                  size="lg"
                  onClick={togglePlayPause}
                  className={`w-24 h-24 rounded-full glot-button-orange hover-lift text-white shadow-lg touch-manipulation transition-all duration-500 ${
                    isPlaying ? 'animate-[breathe_2s_ease-in-out_infinite]' : 'hover:scale-105'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </Button>
              </CardContent>
            </Card>


            {/* Language Switcher */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t('listener.switchLanguage')}</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                       <SelectValue placeholder={t('listener.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-1">
                            <span>{lang.flag}</span>
                            <span className="text-foreground">{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    );
  }

  // Connection Screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <InterfaceLanguageSelector />
      <div className="w-full max-w-md space-y-8">
        
        {/* Glot Branding */}
        <div className="text-center space-y-4">
          <a href="/">
            <img src={glotLogoNew} alt="Glot" className="h-16 mx-auto cursor-pointer hover:opacity-80 transition-opacity" />
          </a>
          <div>
             <h1 className="text-3xl font-light mb-2">{t('listener.joinEvent')}</h1>
          </div>
        </div>

        {/* Connection Form */}
        <Card className="glot-card">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl">{t('listener.connection')}</CardTitle>
            <CardDescription>{t('listener.joinEvent')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Event Code */}
            <div className="space-y-3">
              <Label htmlFor="eventCode" className="text-sm font-semibold">
                {t('listener.eventCode')}
              </Label>
              <Input
                id="eventCode"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                className="text-center text-lg font-mono tracking-wider uppercase"
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <Label htmlFor="language" className="text-sm font-semibold">
                {t('listener.translationLanguage')}
              </Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language" className="h-12">
                  <SelectValue placeholder={t('listener.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {connectionError && (
              <div className="text-sm text-destructive-foreground text-center p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                {connectionError}
              </div>
            )}

            {/* Connect Button */}
            <Button 
              className="w-full glot-button-orange" 
              onClick={handleConnect}
              disabled={!eventCode || !selectedLanguage}
              size="lg"
            >
              {t('listener.connect')}
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Scanner */}
        <Card className="glot-card bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowQRScanner(true)}>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:bg-primary/20 transition-colors">
              <div className="w-12 h-12 border-2 border-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
            </div>
            <h3 className="font-semibold mb-2 text-lg">{t('listener.scanQRCode')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('listener.scanQRDescription')}
            </p>
          </CardContent>
        </Card>

        {/* QR Scanner Dialog */}
        <QRCodeScanner 
          open={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />

        {/* Device Compatibility */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-6 mb-3">
            <span className="text-2xl">📱</span>
            <span className="text-2xl">💻</span>
            <span className="text-2xl">🖥️</span>
          </div>
           <p className="text-sm text-muted-foreground">
             {t('listener.deviceCompatibility')}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Listener;