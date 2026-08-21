-- Phase 2 Database Migration
-- Adds Linkwarden 2.16.1 parity columns and tables to IT-Bookmark

-- 1. Extend Users Table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_tagging_method TEXT DEFAULT 'DISABLED';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_predefined_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_tag_existing_links BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS archive_as_screenshot BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS archive_as_monolith BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS archive_as_pdf BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS archive_as_readable BOOLEAN DEFAULT true;

-- 2. Extend Collections Table
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS icon_weight TEXT;

-- 3. Extend Tags Table
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS ai_tag BOOLEAN DEFAULT false;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS archive_as_screenshot BOOLEAN;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS archive_as_monolith BOOLEAN;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS archive_as_pdf BOOLEAN;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS archive_as_readable BOOLEAN;

-- 4. Extend Bookmarks Table for Search and Monolith
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS monolith_path TEXT;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS ai_tagged BOOLEAN DEFAULT false;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS text_content TEXT;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS search_index tsvector;

-- P1-IMP-004: Add import_date to preserve original bookmark creation dates during import
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS import_date TIMESTAMP WITH TIME ZONE;

-- Create GIN index for search_index
CREATE INDEX IF NOT EXISTS bookmarks_search_index_idx ON public.bookmarks USING GIN (search_index);

-- 5. Collection Members (Collaboration)
CREATE TABLE IF NOT EXISTS public.collection_members (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, collection_id)
);

-- 6. API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    scopes TEXT[] DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RSS Subscriptions
CREATE TABLE IF NOT EXISTS public.rss_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    last_build_date TIMESTAMP WITH TIME ZONE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Highlights (Annotations)
CREATE TABLE IF NOT EXISTS public.highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    color TEXT NOT NULL,
    comment TEXT,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    text TEXT NOT NULL,
    bookmark_id UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Dashboard Sections
CREATE TABLE IF NOT EXISTS public.dashboard_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('STATS', 'RECENT_LINKS', 'PINNED_LINKS', 'COLLECTION')),
    order_index INTEGER NOT NULL,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, collection_id)
);

-- 10. Archive Jobs Tracking (If manually managing instead of raw pg-boss schema)
CREATE TABLE IF NOT EXISTS public.archive_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bookmark_id UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'archive', 'index', 'ai-tag'
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'partial_success', 'failed', 'retrying', 'cancelled')),
    attempt_count INTEGER DEFAULT 0,
    last_error TEXT,
    worker_id TEXT,
    locked_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    next_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Ensure you run `NOTIFY pgrst, 'reload schema';` after applying this migration if using PostgREST/Supabase APIs.

-- 11. Search Bookmarks RPC
CREATE OR REPLACE FUNCTION search_bookmarks(search_query TEXT, p_user_id UUID)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id
  FROM bookmarks b
  WHERE b.user_id = p_user_id
    AND b.search_index @@ websearch_to_tsquery('english', search_query)
  ORDER BY ts_rank(b.search_index, websearch_to_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;

-- 12. Update Bookmark Search Index RPC
CREATE OR REPLACE FUNCTION update_bookmark_search_index(
  p_bookmark_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_url TEXT,
  p_content TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE bookmarks
  SET search_index = 
    setweight(to_tsvector('english', coalesce(p_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(p_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(p_url, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(p_content, '')), 'D')
  WHERE id = p_bookmark_id;
END;
$$ LANGUAGE plpgsql;
