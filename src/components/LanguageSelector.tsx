import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SUPPORTED_LANGUAGES, getLanguageByCode, formatTranslationPair, POPULAR_LANGUAGES } from '@/utils/languages';

interface LanguageSelectorProps {
  sourceLanguage?: string;
  targetLanguages?: string[];
  onSourceLanguageChange?: (language: string) => void;
  onTargetLanguagesChange?: (languages: string[]) => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage = 'fr',
  targetLanguages = ['en'],
  onSourceLanguageChange,
  onTargetLanguagesChange,
  className = ''
}) => {
  const [selectedSource, setSelectedSource] = useState(sourceLanguage);
  const [selectedTargets, setSelectedTargets] = useState<string[]>(targetLanguages);

  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    onSourceLanguageChange?.(value);
  };

  const toggleTargetLanguage = (langCode: string) => {
    const newTargets = selectedTargets.includes(langCode)
      ? selectedTargets.filter(code => code !== langCode)
      : [...selectedTargets, langCode];
    
    setSelectedTargets(newTargets);
    onTargetLanguagesChange?.(newTargets);
  };

  const addPopularLanguages = () => {
    const popularToAdd = POPULAR_LANGUAGES.filter(code => 
      code !== selectedSource && !selectedTargets.includes(code)
    );
    const newTargets = [...selectedTargets, ...popularToAdd.slice(0, 5)];
    setSelectedTargets(newTargets);
    onTargetLanguagesChange?.(newTargets);
  };

  const clearTargetLanguages = () => {
    setSelectedTargets([]);
    onTargetLanguagesChange?.([]);
  };

  const sourceLanguageData = getLanguageByCode(selectedSource);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Configuration des Langues</CardTitle>
        <CardDescription>
          Choisissez la langue source et les langues de traduction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Langue Source */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">Langue Source</label>
          <Select value={selectedSource} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-muted-foreground">({lang.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Langues Cibles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Langues de Traduction</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addPopularLanguages}
                className="text-xs"
              >
                + Populaires
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearTargetLanguages}
                className="text-xs"
              >
                Effacer
              </Button>
            </div>
          </div>

          {/* Langues Sélectionnées */}
          {selectedTargets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Langues sélectionnées:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTargets.map((code) => {
                  const lang = getLanguageByCode(code);
                  return lang ? (
                    <Badge 
                      key={code} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => toggleTargetLanguage(code)}
                    >
                      {lang.flag} {lang.code.toUpperCase()} ×
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Aperçu de la Configuration */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Configuration Actuelle:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{sourceLanguageData?.flag}</span>
              <span className="font-mono text-sm">
                {formatTranslationPair(selectedSource, selectedTargets)}
              </span>
            </div>
          </div>

          {/* Grille de Sélection des Langues */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {SUPPORTED_LANGUAGES
              .filter(lang => lang.code !== selectedSource)
              .map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedTargets.includes(lang.code) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTargetLanguage(lang.code)}
                  className="flex items-center gap-1 text-xs p-2 h-auto"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code.toUpperCase()}</span>
                </Button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;