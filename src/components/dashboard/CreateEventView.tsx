import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';
import { EventShareModal } from '@/components/dashboard/EventShareModal';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

const eventSchema = z.object({
  title: z.string().min(3).max(200),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()).min(1),
  eventType: z.enum(['public', 'private']),
  scheduledAt: z.date().optional(),
});

interface CreateEventViewProps {
  onSuccess?: () => void;
}

const CreateEventView = ({ onSuccess }: CreateEventViewProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [eventType, setEventType] = useState<'public' | 'private'>('public');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Validate
      const validation = eventSchema.safeParse({
        title,
        sourceLanguage,
        targetLanguages,
        eventType,
        scheduledAt: scheduledDate,
      });

      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach(err => {
          if (err.path[0]) {
            const path = err.path[0] as string;
            if (path === 'title') {
              if (err.code === 'too_small') {
                newErrors[path] = t('organizer.create.titleTooShort');
              } else if (err.code === 'too_big') {
                newErrors[path] = t('organizer.create.titleTooLong');
              }
            } else if (path === 'targetLanguages') {
              newErrors[path] = t('organizer.create.languageRequired');
            }
          }
        });
        setErrors(newErrors);
        throw new Error('Validation failed');
      }

      // Generate codes
      const { data: eventCode } = await supabase.rpc('generate_event_code');
      const { data: speakerKey } = await supabase.rpc('generate_speaker_key');

      if (!eventCode || !speakerKey) throw new Error('Failed to generate codes');

      // Create event
      const { data, error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title,
          source_language: sourceLanguage,
          target_languages: targetLanguages,
          event_code: eventCode,
          speaker_key: speakerKey,
          event_type: eventType,
          status: scheduledDate ? 'scheduled' : 'active',
          scheduled_at: scheduledDate?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(t('organizer.create.success'));
      setCreatedEvent(data);
      
      // Reset form
      setTitle('');
      setTargetLanguages([]);
      setScheduledDate(undefined);
      setErrors({});
    },
    onError: (error: any) => {
      if (error.message !== 'Validation failed') {
        toast.error(t('organizer.create.error'));
      }
    },
  });

  const toggleTargetLanguage = (langCode: string) => {
    setTargetLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate();
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{t('organizer.create.title')}</CardTitle>
          <CardDescription>
            {t('organizer.create.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">{t('organizer.create.eventTitle')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('organizer.create.eventTitlePlaceholder')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label>{t('organizer.create.eventDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, 'PPP', { locale: fr })
                    ) : (
                      <span>{t('organizer.create.chooseDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                {t('organizer.create.dateNote')}
              </p>
            </div>

            {/* Source Language */}
            <div className="space-y-2">
              <Label htmlFor="source">{t('organizer.create.sourceLanguage')}</Label>
              <select
                id="source"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Languages */}
            <div className="space-y-2">
              <Label>{t('organizer.create.targetLanguages')}</Label>
              {targetLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {targetLanguages.map((langCode) => {
                    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
                    return (
                      <Badge key={langCode} variant="secondary" className="gap-1">
                        {lang?.flag} {lang?.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleTargetLanguage(langCode)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                {SUPPORTED_LANGUAGES
                  .filter((lang) => lang.code !== sourceLanguage)
                  .map((lang) => (
                    <Button
                      key={lang.code}
                      type="button"
                      variant={targetLanguages.includes(lang.code) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTargetLanguage(lang.code)}
                      className="justify-start"
                    >
                      {targetLanguages.includes(lang.code) ? (
                        <X className="h-3 w-3 mr-1" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      {lang.flag} {lang.name}
                    </Button>
                  ))}
              </div>
              {errors.targetLanguages && (
                <p className="text-sm text-destructive">{errors.targetLanguages}</p>
              )}
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>{t('organizer.create.eventType')}</Label>
              <RadioGroup value={eventType} onValueChange={(v) => setEventType(v as 'public' | 'private')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="font-normal cursor-pointer">
                    {t('organizer.create.publicType')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="font-normal cursor-pointer">
                    {t('organizer.create.privateType')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createEventMutation.isPending || !title || targetLanguages.length === 0}
            >
              {createEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('organizer.create.creating')}
                </>
              ) : (
                t('organizer.create.createButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {createdEvent && (
        <EventShareModal
          event={createdEvent}
          open={!!createdEvent}
          onClose={() => {
            setCreatedEvent(null);
            onSuccess?.();
          }}
        />
      )}
    </>
  );
};

export default CreateEventView;
