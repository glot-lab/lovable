// Configuration complète des langues supportées par OpenAI pour la traduction simultanée
// Basé sur les langues supportées par les modèles OpenAI GPT et Whisper

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
];

// Langues les plus populaires pour la traduction simultanée
export const POPULAR_LANGUAGES = [
  'fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'
];

// Fonction pour obtenir une langue par son code
export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

// Fonction pour obtenir les langues populaires
export const getPopularLanguages = (): Language[] => {
  return POPULAR_LANGUAGES.map(code => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === code)!
  ).filter(Boolean);
};

// Fonction pour formater l'affichage des langues de traduction
export const formatTranslationPair = (from: string, to: string[]): string => {
  const fromLang = getLanguageByCode(from);
  const toLangs = to.map(code => getLanguageByCode(code)?.code.toUpperCase()).filter(Boolean);
  
  return `${fromLang?.code.toUpperCase()} → ${toLangs.join(', ')}`;
};

// Exemples de combinaisons de langues courantes
export const COMMON_TRANSLATION_COMBINATIONS = [
  { from: 'fr', to: ['en', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ar'] },
  { from: 'en', to: ['fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ar'] },
  { from: 'es', to: ['en', 'fr', 'de', 'it', 'pt'] },
  { from: 'de', to: ['en', 'fr', 'es', 'it'] },
  { from: 'it', to: ['en', 'fr', 'es', 'de'] },
  { from: 'pt', to: ['en', 'fr', 'es'] },
  { from: 'ru', to: ['en', 'fr', 'de'] },
  { from: 'zh', to: ['en', 'fr', 'ja'] },
  { from: 'ja', to: ['en', 'fr', 'zh'] },
  { from: 'ar', to: ['en', 'fr'] }
];