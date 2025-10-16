import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventValidationResponse } from '@/types/event';

export const useEventConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>("");

  const validateEventCode = async (
    eventCode: string,
    selectedLanguage: string
  ): Promise<EventValidationResponse | null> => {
    setError("");
    setIsConnecting(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('validate_event_code', {
        _event_code: eventCode.trim().toUpperCase()
      });

      if (rpcError) {
        console.error('Error validating event code:', rpcError);
        setError('invalidEventCode');
        return null;
      }

      if (!data) {
        setError('invalidEventCode');
        return null;
      }

      const eventData = data as unknown as EventValidationResponse;
      
      if (!eventData.target_languages?.includes(selectedLanguage)) {
        setError('languageNotAvailable');
        return null;
      }

      return eventData;
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('connectionError');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    validateEventCode,
    isConnecting,
    error,
    setError,
  };
};
