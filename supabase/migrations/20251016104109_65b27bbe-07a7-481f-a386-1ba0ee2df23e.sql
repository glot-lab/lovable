-- Fix critical security issue: Remove public access to events table that exposes speaker_key
DROP POLICY IF EXISTS "Public can view active public events" ON public.events;

-- Create a secure function to validate event codes without exposing speaker_key
CREATE OR REPLACE FUNCTION public.validate_event_code(_event_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'title', title,
    'source_language', source_language,
    'target_languages', target_languages,
    'status', status,
    'event_type', event_type
  )
  INTO event_data
  FROM events
  WHERE event_code = _event_code
    AND status IN ('active', 'scheduled')
    AND (event_type = 'public' OR event_type = 'private');
  
  RETURN event_data;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.validate_event_code TO anon;
GRANT EXECUTE ON FUNCTION public.validate_event_code TO authenticated;