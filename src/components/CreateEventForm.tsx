import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, getLanguageByCode, POPULAR_LANGUAGES } from '@/utils/languages';

interface CreateEventFormProps {
  onEventCreated: (eventData: any) => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated }) => {
  const { t } = useLanguage();
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['en']);
  const [eventType, setEventType] = useState('public');

  const toggleTargetLanguage = (langCode: string) => {
    setTargetLanguages(prev => 
      prev.includes(langCode)
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const eventData = {
      title: eventTitle,
      date: eventDate,
      sourceLanguage,
      targetLanguages,
      eventType,
      eventCode: `${eventTitle.replace(/\s/g, '').toUpperCase().slice(0, 8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      shareLink: `${window.location.origin}/listener?code=${eventTitle.replace(/\s/g, '').toUpperCase().slice(0, 8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    };

    onEventCreated(eventData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t('organizer.workflow.eventTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="eventTitle" className="text-sm font-semibold">
              {t('organizer.workflow.eventTitle')}
            </Label>
            <Input
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder={t('organizer.workflow.eventTitlePlaceholder')}
              className="w-full"
              required
            />
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="eventDate" className="text-sm font-semibold">
              {t('organizer.workflow.eventDate')}
            </Label>
            <Input
              id="eventDate"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Source Language */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t('organizer.workflow.sourceLanguage')}
            </Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger>
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

          {/* Target Languages */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t('organizer.workflow.targetLanguages')}
            </Label>

            {/* Selected Languages */}
            {targetLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {targetLanguages.map((code) => {
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
            )}

            {/* Language Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {SUPPORTED_LANGUAGES
                .filter(lang => lang.code !== sourceLanguage)
                .map((lang) => (
                  <Button
                    key={lang.code}
                    type="button"
                    variant={targetLanguages.includes(lang.code) ? "default" : "outline"}
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

          {/* Event Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t('organizer.workflow.eventType')}
            </Label>
            <RadioGroup value={eventType} onValueChange={setEventType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">{t('organizer.workflow.eventTypePublic')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">{t('organizer.workflow.eventTypePrivate')}</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            className="w-full glot-button hover-lift"
            disabled={!eventTitle.trim() || targetLanguages.length === 0}
          >
            {t('organizer.workflow.createEventButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEventForm;