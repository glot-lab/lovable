import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HeadphonesIcon, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import glotLogoNew from "@/assets/glot-logo-new.png";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <InterfaceLanguageSelector />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="mb-8 animate-scale-in">
            <a href="/">
              <img 
                src={glotLogoNew} 
                alt="Glot" 
                className="h-20 md:h-24 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
          
          <div className="space-y-4 animate-slide-up">
            <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('home.tagline')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glot-button hover-lift px-8 py-3" asChild>
                <a href="/listener">{t('nav.joinEvent')}</a>
              </Button>
              <Button size="lg" className="glot-button-outline hover-lift px-8 py-3" asChild>
                <a href="/organizer">{t('nav.organizer')}</a>
              </Button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer Links */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-center sm:text-left text-sm">
          <a 
            href="/privacy-policy" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('home.privacyPolicy')}
          </a>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <a 
            href="/terms-of-service" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('home.termsOfService')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;