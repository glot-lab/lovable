import glotLogoNew from "@/assets/glot-logo-new.png";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";

interface GlotLandingPageProps {
  onJoinEvent: () => void;
}

const GlotLandingPage = ({ onJoinEvent }: GlotLandingPageProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8 animate-fade-in">
      <InterfaceLanguageSelector />
      
      {/* Logo */}
      <div className="mb-8 animate-scale-in">
        <a href="/">
          <img 
            src={glotLogoNew} 
            alt="Glot" 
            className="h-20 md:h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          />
        </a>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-8 animate-slide-up">
        {t('landing.welcome')}
      </h1>

      {/* Content Container */}
      <div className="text-center mb-10 max-w-lg animate-slide-up">
        {/* Main instruction */}
        <p className="text-lg text-muted-foreground mb-8 font-medium">
          {t('landing.bluetoothInstruction')}
        </p>
        
        {/* Quick start section */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-foreground mb-4">
            {t('landing.quickStart')}
          </p>
          <div className="text-left space-y-3">
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('landing.step1')}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('landing.step2')}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('landing.step3')}
            </p>
          </div>
        </div>
        
        {/* Ready message */}
        <p className="text-lg font-semibold text-foreground">
          {t('landing.readyMessage')}
        </p>
      </div>

      {/* Main CTA Button */}
      <button
        onClick={onJoinEvent}
        className="w-full max-w-xs glot-button-orange hover-lift py-4 px-8 rounded-lg mb-8 animate-scale-in font-semibold"
      >
        {t('landing.joinEvent')}
      </button>

      {/* Secondary Link */}
      <a 
        href="https://getglot.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-base text-muted-foreground hover:text-foreground underline underline-offset-4 mb-auto transition-colors"
      >
        {t('landing.learnMore')}
      </a>

      {/* Footer */}
      <footer className="mt-auto pt-8">
        <div className="text-sm text-muted-foreground text-center space-x-2">
          <a 
            href="https://getglot.com/legal/privacy-policy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4 transition-colors"
          >
            {t('landing.privacyPolicy')}
          </a>
          <span>•</span>
          <a 
            href="https://getglot.com/legal/terms-of-service" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4 transition-colors"
          >
            {t('landing.termsOfService')}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default GlotLandingPage;