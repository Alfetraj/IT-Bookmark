-- Phase 14: Collaboration & Sharing Migration

-- 1. Add sharing columns to collections
ALTER TABLE public.collections 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Generate a share token for a collection
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 2. Create collection_members table for collaboration
CREATE TABLE IF NOT EXISTS public.collection_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(collection_id, user_id)
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS collection_members_user_id_idx ON public.collection_members(user_id);
CREATE INDEX IF NOT EXISTS collection_members_collection_id_idx ON public.collection_members(collection_id);

-- 3. RLS Policies
ALTER TABLE public.collection_members ENABLE ROW LEVEL SECURITY;

-- Collection Members Policies
-- Users can see memberships for collections they own or are members of
CREATE POLICY "Users can view memberships for their collections"
ON public.collection_members FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()) OR
    user_id = auth.uid()
);

-- Only collection owners can manage memberships
CREATE POLICY "Only collection owners can manage memberships"
ON public.collection_members FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);

-- Update Collections Policies to allow members to view
-- Drop existing policies first if needed (assuming simple ones were in place)
-- (In a real migration we'd drop the specific names, but here we add additive policies)
CREATE POLICY "Collection members can view the collection"
ON public.collections FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = id AND cm.user_id = auth.uid()) OR
    is_public = true
);

-- Update Bookmarks Policies to allow members to view/edit
CREATE POLICY "Collection members can view bookmarks"
ON public.bookmarks FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = collection_id AND cm.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.is_public = true)
);

CREATE POLICY "Collection editors can insert bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = collection_id AND cm.user_id = auth.uid() AND cm.role = 'editor')
);

CREATE POLICY "Collection editors can update bookmarks"
ON public.bookmarks FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = collection_id AND cm.user_id = auth.uid() AND cm.role = 'editor')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = collection_id AND cm.user_id = auth.uid() AND cm.role = 'editor')
);
