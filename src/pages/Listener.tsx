import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Play, Pause, Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import glotLogoNew from "@/assets/glot-logo-new.png";
import GlotLandingPage from "@/components/GlotLandingPage";

const Listener = () => {
  const { t } = useLanguage();
  const [eventCode, setEventCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const availableLanguages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const handleConnect = () => {
    if (eventCode && selectedLanguage) {
      setIsConnected(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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
                {/* Event Title */}
                <h1 className="text-2xl font-semibold mb-6 text-foreground">Tech Conference 2024</h1>
                
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

        {/* Footer */}
        <div className="border-t bg-muted/30 p-4">
          <div className="container mx-auto text-center">
             <p className="text-sm text-muted-foreground">
               {t('listener.encryption')}
             </p>
          </div>
        </div>
      </div>
    );
  }

  // Connection Screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Glot Branding */}
        <div className="text-center space-y-4">
          <a href="/">
            <img src={glotLogoNew} alt="Glot" className="h-16 mx-auto cursor-pointer hover:opacity-80 transition-opacity" />
          </a>
          <div>
             <h1 className="text-3xl font-light mb-2">{t('listener.joinEvent')}</h1>
             <p className="text-muted-foreground">
               {t('listener.enterCode')}
             </p>
          </div>
        </div>

        {/* Connection Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-1">
             <CardTitle className="text-xl font-normal">{t('listener.connection')}</CardTitle>
             <CardDescription>
               {t('listener.providedByOrganizer')}
             </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Event Code */}
            <div className="space-y-2">
               <label className="text-sm font-medium">{t('listener.eventCode')}</label>
               <Input
                 placeholder={t('listener.enterCode')}
                 value={eventCode}
                 onChange={(e) => setEventCode(e.target.value)}
                 className="text-center text-lg font-mono tracking-wider"
               />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
               <label className="text-sm font-medium">{t('listener.translationLanguage')}</label>
               <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                 <SelectTrigger>
                   <SelectValue placeholder={t('listener.selectLanguage')} />
                 </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-foreground">{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Connect Button */}
            <Button 
              className="w-full glot-button-orange hover-lift" 
              onClick={handleConnect}
              disabled={!eventCode || !selectedLanguage}
              size="lg"
            >
              {t('listener.connect')}
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Alternative */}
        <Card className="border-0 bg-muted/30">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 border-2 border-muted-foreground rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
            </div>
             <h3 className="font-medium mb-2">{t('listener.scanQRCode')}</h3>
             <p className="text-sm text-muted-foreground">
               {t('listener.scanQRDescription')}
             </p>
          </CardContent>
        </Card>

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