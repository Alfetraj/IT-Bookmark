import { supabase } from '../config/supabase';

export interface SearchProvider {
  search(query: string, userId: string): Promise<string[]>;
  globalSearch(userId: string, query: string): Promise<any[]>;
}

export class PostgresSearchProvider implements SearchProvider {
  async search(query: string, userId: string): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // 1. Try Postgres full-text search RPC if available
    try {
      const { data, error } = await supabase.rpc('search_bookmarks', {
        search_query: trimmed,
        p_user_id: userId,
      });

      if (!error && data && data.length > 0) {
        return data.map((b: any) => b.id);
      }
    } catch (err) {
      console.warn('search_bookmarks RPC error, falling back to comprehensive text matching:', err);
    }

    // 2. Comprehensive text search fallback (title, url, description, notes, readability content)
    const matchingIds = new Set<string>();

    const { data: textMatches, error: textError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .or(
        `title.ilike.%${trimmed}%,url.ilike.%${trimmed}%,description.ilike.%${trimmed}%,notes.ilike.%${trimmed}%,readability_content.ilike.%${trimmed}%`
      );

    if (!textError && textMatches) {
      textMatches.forEach((b: any) => matchingIds.add(b.id));
    }

    // 3. Search by matching Tag names/slugs
    const { data: matchedTags, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .or(`name.ilike.%${trimmed}%,slug.ilike.%${trimmed}%`);

    if (!tagError && matchedTags && matchedTags.length > 0) {
      const tagIds = matchedTags.map((t: any) => t.id);
      const { data: tagBookmarks } = await supabase
        .from('bookmark_tags')
        .select('bookmark_id')
        .in('tag_id', tagIds);

      if (tagBookmarks) {
        tagBookmarks.forEach((tb: any) => matchingIds.add(tb.bookmark_id));
      }
    }

    return Array.from(matchingIds);
  }

  async globalSearch(userId: string, query: string): Promise<any[]> {
    const ids = await this.search(query, userId);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .in('id', ids)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const searchService: SearchProvider = new PostgresSearchProvider();
