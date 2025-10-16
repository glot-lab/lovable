import { supabase } from "@/integrations/supabase/client";

export interface EventInfo {
  id: string;
  title: string;
  source_language: string;
  target_languages: string[];
  status: string;
  event_code: string;
}

export const useSpeakerAuth = () => {
  const verifySpeakerKey = async (speakerKey: string): Promise<EventInfo | null> => {
    try {
      // Verify speaker key against events table
      const { data: event, error } = await supabase
        .from('events')
        .select('id, title, source_language, target_languages, status, event_code')
        .eq('speaker_key', speakerKey)
        .maybeSingle();

      if (error) {
        console.error('Error verifying speaker key:', error);
        return null;
      }

      if (!event) {
        return null;
      }

      // Check if event is in a valid state
      if (event.status === 'archived' || event.status === 'ended') {
        throw new Error(`Event is ${event.status}`);
      }

      return event as EventInfo;
    } catch (error) {
      console.error('Error in verifySpeakerKey:', error);
      throw error;
    }
  };

  const registerSpeakerConnection = async (
    eventId: string,
    speakerKey: string
  ): Promise<string | null> => {
    try {
      // Register speaker connection in event_speakers table
      const { data, error } = await supabase
        .from('event_speakers')
        .insert({
          event_id: eventId,
          speaker_key: speakerKey,
          is_active: true,
          connected_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error registering speaker connection:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in registerSpeakerConnection:', error);
      return null;
    }
  };

  const updateSpeakerDisconnection = async (speakerId: string): Promise<void> => {
    try {
      await supabase
        .from('event_speakers')
        .update({
          is_active: false,
          disconnected_at: new Date().toISOString(),
        })
        .eq('id', speakerId);
    } catch (error) {
      console.error('Error updating speaker disconnection:', error);
    }
  };

  return {
    verifySpeakerKey,
    registerSpeakerConnection,
    updateSpeakerDisconnection,
  };
};
