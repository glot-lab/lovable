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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in relative overflow-hidden">
        <InterfaceLanguageSelector />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Header with Live indicator */}
        <div className="relative border-b bg-card/80 backdrop-blur-md p-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold text-foreground uppercase tracking-wide">{t('listener.live')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">🎧</span>
              <span className="hidden sm:inline">{t('listener.realTimeTranslation')}</span>
            </div>
          </div>
        </div>

        {/* Main Audio Interface */}
        <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-2xl space-y-8 animate-slide-up">
            
            {/* Event Info Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md">
              <CardContent className="p-8 text-center space-y-6">
                
                {/* Language Display */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-2xl">{getLanguageByCode(selectedLanguage)?.flag}</span>
                    <span className="text-lg font-semibold text-foreground">{getLanguageByCode(selectedLanguage)?.name}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{t('listener.realTimeTranslation')}</p>
                </div>

                {/* Visual Audio Waves */}
                <div className="flex items-center justify-center gap-2 h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full bg-gradient-to-t from-primary to-accent transition-all duration-300 ${
                        isPlaying ? 'animate-pulse' : 'opacity-30'
                      }`}
                      style={{
                        height: isPlaying ? `${30 + (i % 3) * 20}px` : '20px',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Play/Pause Button */}
                <div className="relative inline-flex items-center justify-center">
                  {/* Outer glow ring when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl animate-pulse scale-150"></div>
                  )}
                  
                  <Button 
                    size="lg"
                    onClick={togglePlayPause}
                    className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 text-white shadow-2xl touch-manipulation transition-all duration-500 border-4 border-background ${
                      isPlaying 
                        ? 'scale-110 shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]' 
                        : 'hover:scale-105 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                    }`}
                  >
                    <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>
                    {isPlaying ? (
                      <Pause className="w-14 h-14 relative z-10" strokeWidth={2.5} />
                    ) : (
                      <Play className="w-14 h-14 ml-2 relative z-10" strokeWidth={2.5} />
                    )}
                  </Button>
                </div>

                {/* Status Text */}
                <div className="pt-2">
                  <p className="text-sm font-medium text-foreground">
                    {isPlaying ? '🎵 ' + t('listener.listening') : '⏸️ ' + t('listener.paused')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Language Switcher */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="text-lg">🌍</span>
                      {t('listener.switchLanguage')}
                    </label>
                  </div>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
                       <SelectValue placeholder={t('listener.selectLanguage')} />
                    </SelectTrigger>
                     <SelectContent>
                      {AVAILABLE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{lang.flag}</span>
                            <span className="font-medium text-foreground">{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs text-muted-foreground">{t('listener.quality')}</div>
                  <div className="text-sm font-semibold text-foreground">HD</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs text-muted-foreground">{t('listener.latency')}</div>
                  <div className="text-sm font-semibold text-foreground">&lt;1s</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs text-muted-foreground">{t('listener.secure')}</div>
                  <div className="text-sm font-semibold text-foreground">SSL</div>
                </CardContent>
              </Card>
            </div>
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