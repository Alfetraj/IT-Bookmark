-- Phase 13: RSS Integration Migration

-- Create rss_subscriptions table
CREATE TABLE IF NOT EXISTS public.rss_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    last_polled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'error')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for efficient querying by user
CREATE INDEX IF NOT EXISTS rss_subscriptions_user_id_idx ON public.rss_subscriptions(user_id);

-- Enforce RLS
ALTER TABLE public.rss_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own RSS subscriptions"
ON public.rss_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
