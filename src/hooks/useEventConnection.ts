import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventValidationResponse } from '@/types/event';
import { z } from 'zod';

const eventCodeSchema = z.string().regex(/^[A-Z2-9]{8}$/, 'Invalid event code format');

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
      const normalizedCode = eventCode.trim().toUpperCase();
      
      // Validate format before querying database
      const validation = eventCodeSchema.safeParse(normalizedCode);
      if (!validation.success) {
        setError('invalidEventCode');
        setIsConnecting(false);
        return null;
      }

      const { data, error: rpcError } = await supabase.rpc('validate_event_code', {
        _event_code: normalizedCode
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
