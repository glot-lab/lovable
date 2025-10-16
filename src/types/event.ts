export type EventStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'archived';
export type EventType = 'public' | 'private';

export interface Event {
  id: string;
  title: string;
  source_language: string;
  target_languages: string[];
  status: EventStatus;
  event_type: EventType;
  event_code?: string;
  speaker_key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventValidationResponse {
  id: string;
  title: string;
  source_language: string;
  target_languages: string[];
  status: EventStatus;
  event_type: EventType;
}
