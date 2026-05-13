-- 1. Extend compositions status enum to include 'failed'
ALTER TABLE public.compositions
  DROP CONSTRAINT IF EXISTS compositions_status_check;

ALTER TABLE public.compositions
  ADD CONSTRAINT compositions_status_check
  CHECK (status IN ('draft', 'processing', 'complete', 'failed'));

-- 2. Add error_metadata column for failure context
ALTER TABLE public.compositions
  ADD COLUMN IF NOT EXISTS error_metadata jsonb DEFAULT NULL;

-- 3. Cleanup job: reset stuck 'processing' records older than 5 minutes back to 'draft'
-- Run this as a Supabase scheduled function (pg_cron) or call periodically
CREATE OR REPLACE FUNCTION public.reset_stuck_compositions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.compositions
  SET
    status = 'draft',
    error_metadata = jsonb_build_object(
      'reason', 'processing_timeout',
      'reset_at', now()
    ),
    updated_at = now()
  WHERE
    status = 'processing'
    AND updated_at < now() - interval '5 minutes';
END;
$$;

-- 4. Atomic order creation RPC (covers Fix 3 below as well)
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id uuid,
  p_composition_id uuid,
  p_format text,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_composition public.compositions%ROWTYPE;
  v_order_id uuid;
  v_price_cents integer;
  v_existing_order_id uuid;
BEGIN
  -- Idempotency: check for existing order with this key
  SELECT id INTO v_existing_order_id
  FROM public.orders
  WHERE metadata->>'idempotency_key' = p_idempotency_key
    AND user_id = p_user_id
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'order_id', v_existing_order_id,
      'status', 'existing',
      'idempotent', true
    );
  END IF;

  -- Validate composition ownership and status
  SELECT * INTO v_composition
  FROM public.compositions
  WHERE id = p_composition_id
    AND user_id = p_user_id
    AND status = 'complete'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COMPOSITION_NOT_FOUND_OR_INCOMPLETE';
  END IF;

  -- Resolve price
  v_price_cents := CASE p_format
    WHEN 'eau_de_parfum' THEN 8900
    WHEN 'parfum'        THEN 12900
    WHEN 'oil'           THEN 6900
    WHEN 'candle'        THEN 5900
    WHEN 'diffuser'      THEN 7900
    ELSE NULL
  END;

  IF v_price_cents IS NULL THEN
    RAISE EXCEPTION 'INVALID_FORMAT';
  END IF;

  -- Insert order
  INSERT INTO public.orders (user_id, composition_id, format, price_cents, status, metadata)
  VALUES (
    p_user_id,
    p_composition_id,
    p_format,
    v_price_cents,
    'pending',
    jsonb_build_object('idempotency_key', p_idempotency_key)
  )
  RETURNING id INTO v_order_id;

  -- Update composition in same transaction
  UPDATE public.compositions
  SET selected_format = p_format, updated_at = now()
  WHERE id = p_composition_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'status', 'pending',
    'price_cents', v_price_cents,
    'idempotent', false
  );
END;
$$;

-- Grant execute to authenticated users (RLS still applies via p_user_id check inside)
GRANT EXECUTE ON FUNCTION public.create_order_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_stuck_compositions TO service_role;

-- Rate limiting / quota tracking table
CREATE TABLE IF NOT EXISTS public.generation_quota (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_quota_user_created
  ON public.generation_quota (user_id, created_at DESC);

ALTER TABLE public.generation_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own quota records"
  ON public.generation_quota FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
