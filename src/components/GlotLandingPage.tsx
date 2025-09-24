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
            className="h-24 md:h-28 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          />
        </a>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-6 max-w-2xl animate-slide-up">
        {t('landing.welcome')}
      </h1>

      {/* Description */}
      <div className="text-muted-foreground text-center mb-8 max-w-lg leading-relaxed px-4 animate-slide-up space-y-4 mt-16">
        <p className="font-medium">
          {t('landing.bluetoothInstruction')}
        </p>
        
        <div className="text-left mt-8">
          <p className="font-medium mb-3">{t('landing.quickStart')}</p>
          <ol className="space-y-2 text-sm">
            <li>{t('landing.step1')}</li>
            <li>{t('landing.step2')}</li>
            <li>{t('landing.step3')}</li>
          </ol>
        </div>
      </div>

      {/* Main CTA Button */}
      <button
        onClick={onJoinEvent}
        className="w-full max-w-xs glot-button-orange hover-lift py-4 px-8 rounded-lg mb-6 animate-scale-in"
      >
        {t('landing.joinEvent')}
      </button>

      {/* Secondary Link */}
      <a 
        href="https://getglot.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 mb-auto transition-colors"
      >
        {t('landing.learnMore')}
      </a>

      {/* Footer */}
      <footer className="mt-auto pt-8">
        <div className="text-xs text-muted-foreground text-center space-x-2">
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