import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import glotLogoWhite from "@/assets/glot-logo-white.png";

const heroImages = [
  { src: "/img/hero-1.webp", alt: "Conference participants in museum setting" },
  { src: "/img/hero-2.jpg", alt: "International assembly hall with delegates" },
  { src: "/img/hero-3.jpg", alt: "Conference networking and conversation" },
  { src: "/img/hero-4.jpg", alt: "Humanitarian aid coordination meeting" },
];

const Index = () => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Only run slideshow if user doesn't prefer reduced motion
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // 6 seconds per image

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4">
        <div className="flex justify-end">
          <InterfaceLanguageSelector />
        </div>
      </header>

      {/* Hero Slideshow Section */}
      <section className="slideshow-container" role="banner" aria-label="Hero slideshow">
        {/* Background Images */}
        {heroImages.map((image, index) => (
          <picture key={index}>
            <source 
              media="(max-width: 800px)" 
              srcSet={`${image.src}?w=800&q=80`}
              type="image/webp"
            />
            <img
              src={image.src}
              alt={image.alt}
              className={`slideshow-image ${index === currentImageIndex ? 'active' : ''}`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{ 
                willChange: prefersReducedMotion ? 'auto' : 'opacity',
              }}
            />
          </picture>
        ))}

        {/* Dark Overlay */}
        <div className="slideshow-overlay" aria-hidden="true" />

        {/* Content */}
        <div className="slideshow-content">
          <div className="text-center space-y-3 max-w-4xl mx-auto animate-fade-in">
            {/* Logo - Moved to top and enlarged */}
            <div className="mb-2 animate-scale-in">
              <a 
                href="/" 
                className="inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded"
                aria-label="Glot homepage"
              >
                <img 
                  src={glotLogoWhite} 
                  alt="Glot" 
                  className="h-24 md:h-32 lg:h-36 w-auto mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                />
              </a>
            </div>
            
            {/* Main Heading - Further reduced */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight max-w-3xl mx-auto animate-slide-up">
              {t('home.tagline')}
            </h1>
            
            {/* Subheading */}
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Connect, translate, and communicate seamlessly across languages in real-time
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 animate-scale-in">
              <Button 
                size="lg" 
                className="glot-button-white hover-lift w-full sm:w-auto" 
                asChild
              >
                <a href="/listener" className="flex items-center justify-center">
                  {t('nav.joinEvent')}
                </a>
              </Button>
              <Button 
                size="lg" 
                className="glot-button-white-outline hover-lift w-full sm:w-auto" 
                asChild
              >
                <a href="/organizer" className="flex items-center justify-center">
                  {t('nav.organizer')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Links */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 p-2 pb-4">
        <div className="flex flex-row gap-0 justify-center items-center text-center text-sm">
          <a 
            href="/privacy-policy" 
            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded px-2 py-1"
            style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {t('home.privacyPolicy')}
          </a>
          <span className="hidden sm:inline text-white/60">•</span>
          <a 
            href="/terms-of-service" 
            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded px-2 py-1"
            style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {t('home.termsOfService')}
          </a>
        </div>
      </footer>

      {/* Screen Reader Announcements for Slideshow Changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Showing image ${currentImageIndex + 1} of ${heroImages.length}: ${heroImages[currentImageIndex].alt}`}
      </div>
    </div>
  );
};

export default Index;