-- Fix Critical Security Issues

-- 1. Add missing RLS policies for event_participants
CREATE POLICY "Participants can update their own session"
  ON event_participants FOR UPDATE
  USING (
    listener_id IS NOT NULL 
    AND auth.uid() = listener_id
  );

CREATE POLICY "Organizers can update participants in their events"
  ON event_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Participants can delete their own session"
  ON event_participants FOR DELETE
  USING (
    listener_id IS NOT NULL 
    AND auth.uid() = listener_id
  );

CREATE POLICY "Organizers can delete participants from their events"
  ON event_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- 2. Add missing INSERT policy for event_speakers
CREATE POLICY "Speakers can register themselves"
  ON event_speakers FOR INSERT
  WITH CHECK (
    speaker_id IS NOT NULL 
    AND auth.uid() = speaker_id
  );

-- 3. Add server-side validation for events table
ALTER TABLE events
  ADD CONSTRAINT title_length CHECK (length(trim(title)) >= 3 AND length(trim(title)) <= 200);

ALTER TABLE events
  ADD CONSTRAINT target_languages_not_empty CHECK (array_length(target_languages, 1) > 0);

ALTER TABLE events
  ADD CONSTRAINT source_language_not_empty CHECK (length(trim(source_language)) > 0);

-- 4. Add size limit for device_info JSONB (10KB limit)
ALTER TABLE event_participants
  ADD CONSTRAINT device_info_size CHECK (
    device_info IS NULL 
    OR pg_column_size(device_info) < 10240
  );

-- 5. Add indexes for better RLS policy performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_listener_id ON event_participants(listener_id);
CREATE INDEX IF NOT EXISTS idx_event_speakers_event_id ON event_speakers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_speakers_speaker_id ON event_speakers(speaker_id);