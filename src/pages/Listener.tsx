import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import glotLogoNew from "@/assets/glot-logo-new.png";
import GlotLandingPage from "@/components/GlotLandingPage";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { AVAILABLE_LANGUAGES, getLanguageByCode } from "@/constants/languages";
import { useEventConnection } from "@/hooks/useEventConnection";

const Listener = () => {
  const { t } = useLanguage();
  const { validateEventCode, error: connectionError, setError } = useEventConnection();
  
  const [eventCode, setEventCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleConnect = async () => {
    if (!eventCode.trim() || !selectedLanguage) {
      setError(t('listener.invalidEventCode'));
      return;
    }

    const eventData = await validateEventCode(eventCode, selectedLanguage);
    
    if (eventData) {
      setIsConnected(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleQRScan = (scannedCode: string) => {
    setEventCode(scannedCode.toUpperCase());
    setShowQRScanner(false);
  };

  if (showLanding) {
    return <GlotLandingPage onJoinEvent={() => setShowLanding(false)} />;
  }

  if (isConnected) {
    return (
      <div className="min-h-screen bg-background animate-fade-in relative overflow-hidden">
        <InterfaceLanguageSelector />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glot-turquoise/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glot-orange/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header with Live indicator */}
        <div className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <div className="container mx-auto flex items-center justify-center max-w-4xl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('listener.live')}</span>
            </div>
          </div>
        </div>

        {/* Main Audio Interface */}
        <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-2xl space-y-8 animate-slide-up">
            
            {/* Event Info Card */}
            <Card className="glot-card border-border/30">
              <CardContent className="p-12 text-center space-y-12">
                
                {/* Language Display */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-glot-turquoise/10 border border-glot-turquoise/20">
                    <span className="text-2xl">{getLanguageByCode(selectedLanguage)?.flag}</span>
                    <span className="text-base font-semibold text-foreground">{getLanguageByCode(selectedLanguage)?.name}</span>
                  </div>
                </div>
                
                {/* Play/Pause Button */}
                <div className="relative inline-flex items-center justify-center py-6">
                  <Button 
                    size="lg"
                    onClick={togglePlayPause}
                    className={`relative w-48 h-16 rounded-2xl bg-glot-orange hover:bg-glot-orange-dark text-white shadow-lg touch-manipulation transition-all duration-300 border-2 border-glot-orange/20 ${
                      isPlaying 
                        ? 'shadow-[0_0_30px_hsl(var(--glot-orange)/0.3)]' 
                        : 'hover:shadow-[0_0_20px_hsl(var(--glot-orange)/0.2)]'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 relative z-10" strokeWidth={2} />
                    ) : (
                      <Play className="w-8 h-8 ml-1 relative z-10" strokeWidth={2} />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Language Switcher */}
            <Card className="glot-card border-border/30">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('listener.switchLanguage')}
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-12 border-border hover:border-glot-turquoise/50 transition-colors">
                       <SelectValue placeholder={t('listener.selectLanguage')} />
                    </SelectTrigger>
                     <SelectContent>
                      {AVAILABLE_LANGUAGES.map((lang) => (
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
                  {AVAILABLE_LANGUAGES.map((lang) => (
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

            {connectionError && (
              <div className="text-sm text-destructive-foreground text-center p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                {t(`listener.${connectionError}`)}
              </div>
            )}

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

        <Card 
          className="glot-card bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" 
          onClick={() => setShowQRScanner(true)}
        >
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

        <QRCodeScanner 
          open={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />

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