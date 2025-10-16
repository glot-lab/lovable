import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import { Mic, MicOff, Settings, Users, Activity, ExternalLink, Circle, ArrowLeft, Loader2 } from "lucide-react";
import glotLogoNew from "@/assets/glot-logo-new.png";
import { useLocation } from "react-router-dom";
import { useSpeakerAuth } from "@/hooks/useSpeakerAuth";
import { useToast } from "@/hooks/use-toast";

const Speaker = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { toast } = useToast();
  const { verifySpeakerKey, registerSpeakerConnection, updateSpeakerDisconnection } = useSpeakerAuth();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [broadcastKey, setBroadcastKey] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [latency, setLatency] = useState(85);
  const [pipelineHealth, setPipelineHealth] = useState<'healthy' | 'degraded' | 'offline'>('healthy');
  const [participants, setParticipants] = useState({
    fr: 24,
    en: 18,
    es: 7,
    de: 5
  });
  const [eventTitle, setEventTitle] = useState('');
  const [eventId, setEventId] = useState('');
  const [speakerSessionId, setSpeakerSessionId] = useState<string | null>(null);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Get available audio devices and handle navigation from organizer
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing audio devices:', error);
      }
    };

    getAudioDevices();

    // Check if navigating from organizer flow
    if (location.state?.eventData && location.state?.autoLogin) {
      const eventData = location.state.eventData;
      setBroadcastKey(eventData.eventCode || '');
      setSourceLanguage(eventData.sourceLanguage || 'en');
      setEventTitle(eventData.title || '');
      // Auto-login if event data is provided
      if (eventData.eventCode) {
        setIsLoggedIn(true);
      }
    }
  }, [location.state]);

  // Audio monitoring for volume meter
  useEffect(() => {
    if (selectedDevice && !isBroadcasting) {
      setupAudioMonitoring();
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [selectedDevice]);

  const setupAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined }
      });
      
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setVolumeLevel(Math.round((average / 128) * 100));
          requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };

  const handleLogin = async () => {
    if (!broadcastKey.trim()) return;

    setIsLoggingIn(true);
    
    try {
      // Verify speaker key and get event info
      const eventInfo = await verifySpeakerKey(broadcastKey);
      
      if (!eventInfo) {
        toast({
          title: t('common.error'),
          description: "Clé de diffusion invalide",
          variant: "destructive",
        });
        return;
      }

      // Register speaker connection
      const sessionId = await registerSpeakerConnection(eventInfo.id, broadcastKey);
      
      if (!sessionId) {
        toast({
          title: t('common.error'),
          description: "Erreur lors de l'enregistrement de la connexion",
          variant: "destructive",
        });
        return;
      }

      // Set event info and login
      setEventId(eventInfo.id);
      setEventTitle(eventInfo.title);
      setSourceLanguage(eventInfo.source_language);
      setSpeakerSessionId(sessionId);
      setIsLoggedIn(true);

      toast({
        title: t('common.success'),
        description: `Connecté à l'événement : ${eventInfo.title}`,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "Impossible de se connecter";
      if (error.message?.includes('archived')) {
        errorMessage = "Cet événement a été archivé";
      } else if (error.message?.includes('ended')) {
        errorMessage = "Cet événement est terminé";
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Cleanup on unmount - update disconnection time
  useEffect(() => {
    return () => {
      if (speakerSessionId) {
        updateSpeakerDisconnection(speakerSessionId);
      }
    };
  }, [speakerSessionId]);

  const handleTestAudio = () => {
    setIsTestingAudio(true);
    // Simulate audio test
    setTimeout(() => {
      setIsTestingAudio(false);
    }, 2000);
  };

  const handleBroadcastToggle = () => {
    setIsBroadcasting(!isBroadcasting);
    
    // Simulate latency and health changes
    if (!isBroadcasting) {
      const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * 50) + 65);
        setPipelineHealth(Math.random() > 0.1 ? 'healthy' : 'degraded');
      }, 2000);
      
      return () => clearInterval(interval);
    }
  };

  const openParticipantView = () => {
    window.open('/listener', '_blank');
  };

  const getHealthColor = () => {
    switch (pipelineHealth) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthDot = () => {
    switch (pipelineHealth) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <InterfaceLanguageSelector />

        {/* Login Form */}
        <div className="container mx-auto px-4 max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src={glotLogoNew} alt="Glot" className="h-16" />
            </a>
          </div>
          
          <Card className="glot-card">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">{t('speaker.loginEvent')}</CardTitle>
              <CardDescription className="text-base">{t('speaker.security')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="broadcastKey" className="text-sm font-semibold">{t('speaker.eventKey')}</Label>
                <Input
                  id="broadcastKey"
                  type="password"
                  value={broadcastKey}
                  onChange={(e) => setBroadcastKey(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full glot-button-orange"
                size="lg"
                disabled={!broadcastKey.trim() || isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  t('listener.connect')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <InterfaceLanguageSelector />

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          
          {/* Left Column - Audio Setup */}
          <div className="space-y-4 sm:space-y-6">
            {/* Audio Setup */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('speaker.audioSetup')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('speaker.selectDevice')}</Label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>{t('speaker.volumeMeter')}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={volumeLevel} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-12">{volumeLevel}%</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleTestAudio} 
                  className="w-full"
                  disabled={isTestingAudio}
                >
                  {isTestingAudio ? t('common.testing') + '...' : t('speaker.testAudio')}
                </Button>
              </CardContent>
            </Card>

            {/* Source Language */}
            <Card>
              <CardHeader>
                <CardTitle>{t('speaker.sourceLanguage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('speaker.confirmLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Broadcast Control */}
          <div className="space-y-4 sm:space-y-6">
            {/* Broadcast Button */}
            <Card>
              <CardHeader>
                <CardTitle>{t('speaker.broadcast')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  size="lg"
                  onClick={handleBroadcastToggle}
                  className={`w-full h-16 sm:h-20 text-base sm:text-lg font-semibold ${
                    isBroadcasting 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  disabled={!selectedDevice || !sourceLanguage}
                >
                  {isBroadcasting ? (
                    <>
                      <MicOff className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      <span className="hidden sm:inline">{t('speaker.stopBroadcast')}</span>
                      <span className="sm:hidden">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      <span className="hidden sm:inline">{t('speaker.startBroadcast')}</span>
                      <span className="sm:hidden">Start</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Test Participant View */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  variant="outline" 
                  onClick={openParticipantView}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('speaker.openParticipantView')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Monitoring */}
          <div className="space-y-4 sm:space-y-6">
            {/* Real-time Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('speaker.monitoring')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Latency */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('speaker.latency')}</span>
                  <span className="text-lg font-bold">{latency}ms</span>
                </div>
                
                <Separator />
                
                {/* Pipeline Health */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('speaker.pipelineHealth')}</span>
                  <div className="flex items-center gap-2">
                    <Circle className={`h-3 w-3 ${getHealthDot()}`} />
                    <span className={`text-sm font-medium ${getHealthColor()}`}>
                      {t(`speaker.${pipelineHealth}`)}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Connected Participants */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{t('speaker.connectedParticipants')}</span>
                    <span className="text-lg font-bold">
                      {Object.values(participants).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(participants).map(([lang, count]) => (
                      <div key={lang} className="flex justify-between text-sm">
                        <span className="uppercase font-medium">{lang}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speaker;