ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';
