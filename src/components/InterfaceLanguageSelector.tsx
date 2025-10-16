import { Button } from "@/components/ui/button";
import { useLanguage, InterfaceLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const InterfaceLanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 bg-card/80 backdrop-blur-sm border-border hover:bg-accent text-xs sm:text-sm"
    >
      <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      {language.toUpperCase()}
    </Button>
  );
};

export default InterfaceLanguageSelector;