import { supabase } from '../config/supabase';
import { searchService } from '../services/search.service';

export interface BookmarkRecord {
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  image: string | null;
  notes: string | null;
  is_archived: boolean;
  is_favorite: boolean;
  read_later: boolean;
  archive_status: 'pending' | 'success' | 'failed' | null;
  screenshot_path: string | null;
  pdf_path: string | null;
  readability_content: string | null;
  user_id: string;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookmarkData {
  url: string;
  title: string;
  description?: string | null;
  favicon?: string | null;
  image?: string | null;
  notes?: string | null;
  is_favorite?: boolean;
  read_later?: boolean;
  is_archived?: boolean;
  collection_id?: string | null;
  user_id: string;
}

export interface UpdateBookmarkData {
  url?: string;
  title?: string;
  description?: string | null;
  favicon?: string | null;
  image?: string | null;
  notes?: string | null;
  is_favorite?: boolean;
  read_later?: boolean;
  is_archived?: boolean;
  collection_id?: string | null;
  archive_status?: 'pending' | 'success' | 'failed' | null;
  screenshot_path?: string | null;
  pdf_path?: string | null;
  readability_content?: string | null;
}

export type BookmarkSortOption = 'newest' | 'oldest' | 'alpha_asc' | 'alpha_desc' | 0 | 1 | 2 | 3;

export interface BookmarkFilterQuery {
  collectionId?: string | null;
  tagId?: string;
  tag?: string;
  isFavorite?: boolean;
  readLater?: boolean;
  isArchived?: boolean;
  archiveStatus?: 'pending' | 'success' | 'failed';
  searchQuery?: string;
  sort?: BookmarkSortOption | string;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedBookmarkResult {
  bookmarks: BookmarkRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const normalizeUrlForComparison = (rawUrl: string): { original: string; withWww: string; withoutWww: string } => {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  let withWww = trimmed;
  let withoutWww = trimmed;

  if (trimmed.includes('://www.')) {
    withoutWww = trimmed.replace('://www.', '://');
    withWww = trimmed;
  } else if (trimmed.includes('://')) {
    withWww = trimmed.replace('://', '://www.');
    withoutWww = trimmed;
  }

  return { original: trimmed, withWww, withoutWww };
};

export class BookmarkRepository {
  async findByUserId(userId: string, filters?: BookmarkFilterQuery): Promise<PaginatedBookmarkResult> {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 50));
    const offset = (page - 1) * limit;

    // Get accessible collections (owned + shared member collections)
    const { data: memberCollections } = await supabase
      .from('collection_members')
      .select('collection_id')
      .eq('user_id', userId);

    const accessibleCollectionIds = (memberCollections || []).map((m: any) => m.collection_id);

    let query = supabase.from('bookmarks').select('*', { count: 'exact' });

    // Collection scoping:
    // If a specific collection is requested, check if it's accessible or owned
    if (filters?.collectionId !== undefined) {
      if (filters.collectionId === null || filters.collectionId === 'null' || filters.collectionId === 'none' || filters.collectionId === 'unorganized') {
        query = query.eq('user_id', userId).is('collection_id', null);
      } else {
        query = query.eq('collection_id', filters.collectionId);
      }
    } else {
      // Default: fetch bookmarks owned by user OR in accessible shared collections
      if (accessibleCollectionIds.length > 0) {
        query = query.or(`user_id.eq.${userId},collection_id.in.(${accessibleCollectionIds.join(',')})`);
      } else {
        query = query.eq('user_id', userId);
      }
    }

    if (filters?.isFavorite !== undefined) {
      query = query.eq('is_favorite', filters.isFavorite);
    }

    if (filters?.readLater !== undefined) {
      query = query.eq('read_later', filters.readLater);
    }

    if (filters?.isArchived !== undefined) {
      query = query.eq('is_archived', filters.isArchived);
    }

    if (filters?.archiveStatus !== undefined) {
      query = query.eq('archive_status', filters.archiveStatus);
    }

    // Filter by Tag ID or Tag Name/Slug
    if (filters?.tagId) {
      const { data: tagBookmarks } = await supabase
        .from('bookmark_tags')
        .select('bookmark_id')
        .eq('tag_id', filters.tagId);

      const bookmarkIdsForTag = (tagBookmarks || []).map((tb: any) => tb.bookmark_id);
      if (bookmarkIdsForTag.length === 0) {
        return { bookmarks: [], total: 0, page, limit, totalPages: 0 };
      }
      query = query.in('id', bookmarkIdsForTag);
    } else if (filters?.tag) {
      // Find tag by name or slug
      const { data: matchedTags } = await supabase
        .from('tags')
        .select('id')
        .or(`name.ilike.${filters.tag},slug.eq.${filters.tag.toLowerCase()}`);

      const tagIds = (matchedTags || []).map((t: any) => t.id);
      if (tagIds.length > 0) {
        const { data: tagBookmarks } = await supabase
          .from('bookmark_tags')
          .select('bookmark_id')
          .in('tag_id', tagIds);

        const bookmarkIdsForTag = (tagBookmarks || []).map((tb: any) => tb.bookmark_id);
        if (bookmarkIdsForTag.length === 0) {
          return { bookmarks: [], total: 0, page, limit, totalPages: 0 };
        }
        query = query.in('id', bookmarkIdsForTag);
      } else {
        return { bookmarks: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // Search query
    if (filters?.searchQuery) {
      const searchIds = await searchService.search(filters.searchQuery, userId);
      if (searchIds.length > 0) {
        query = query.in('id', searchIds);
      } else {
        return { bookmarks: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // Sorting
    const sort = String(filters?.sort || 'newest');
    if (sort === 'oldest' || sort === '1' || sort === 'date_asc') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'alpha_asc' || sort === '2' || sort === 'name_asc') {
      query = query.order('title', { ascending: true });
    } else if (sort === 'alpha_desc' || sort === '3' || sort === 'name_desc') {
      query = query.order('title', { ascending: false });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count !== null ? count : (data || []).length;
    const totalPages = Math.ceil(total / limit);

    return {
      bookmarks: data || [],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string, userId: string): Promise<BookmarkRecord | null> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Check direct ownership
    if (data.user_id === userId) return data;

    // Check shared collection membership
    if (data.collection_id) {
      const { data: member } = await supabase
        .from('collection_members')
        .select('role')
        .eq('collection_id', data.collection_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (member) return data;

      // Check if collection is public
      const { data: col } = await supabase
        .from('collections')
        .select('is_public')
        .eq('id', data.collection_id)
        .maybeSingle();

      if (col?.is_public) return data;
    }

    return null;
  }

  async findByUrl(rawUrl: string, userId: string): Promise<BookmarkRecord | null> {
    const { original, withWww, withoutWww } = normalizeUrlForComparison(rawUrl);

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .or(`url.eq.${original},url.eq.${withWww},url.eq.${withoutWww}`)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(data: CreateBookmarkData): Promise<BookmarkRecord> {
    const { data: result, error } = await supabase
      .from('bookmarks')
      .insert({
        url: data.url.trim(),
        title: data.title,
        description: data.description || null,
        favicon: data.favicon || null,
        image: data.image || null,
        notes: data.notes || null,
        is_favorite: data.is_favorite ?? false,
        read_later: data.read_later ?? false,
        is_archived: data.is_archived ?? false,
        collection_id: data.collection_id || null,
        user_id: data.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(id: string, userId: string, data: UpdateBookmarkData): Promise<BookmarkRecord | null> {
    // Permission check: owner or editor of the collection
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    let canEdit = existing.user_id === userId;
    if (!canEdit && existing.collection_id) {
      const { data: member } = await supabase
        .from('collection_members')
        .select('role')
        .eq('collection_id', existing.collection_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (member && (member.role === 'editor' || member.role === 'owner')) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      throw new Error('Forbidden: You do not have permission to edit this bookmark');
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.url !== undefined) updatePayload.url = data.url.trim();
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.favicon !== undefined) updatePayload.favicon = data.favicon;
    if (data.image !== undefined) updatePayload.image = data.image;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.is_favorite !== undefined) updatePayload.is_favorite = data.is_favorite;
    if (data.read_later !== undefined) updatePayload.read_later = data.read_later;
    if (data.is_archived !== undefined) updatePayload.is_archived = data.is_archived;
    if (data.collection_id !== undefined) updatePayload.collection_id = data.collection_id;
    if (data.archive_status !== undefined) updatePayload.archive_status = data.archive_status;
    if (data.screenshot_path !== undefined) updatePayload.screenshot_path = data.screenshot_path;
    if (data.pdf_path !== undefined) updatePayload.pdf_path = data.pdf_path;
    if (data.readability_content !== undefined) updatePayload.readability_content = data.readability_content;

    const { data: result, error } = await supabase
      .from('bookmarks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return result;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.findById(id, userId);
    if (!existing) return false;

    let canDelete = existing.user_id === userId;
    if (!canDelete && existing.collection_id) {
      const { data: member } = await supabase
        .from('collection_members')
        .select('role')
        .eq('collection_id', existing.collection_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (member && (member.role === 'editor' || member.role === 'owner')) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      throw new Error('Forbidden: You do not have permission to delete this bookmark');
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async bulkUpdate(userId: string, bookmarkIds: string[], updates: any): Promise<number> {
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', bookmarkIds)
      .eq('user_id', userId)
      .select('id');

    if (error) throw error;
    return data ? data.length : 0;
  }

  async bulkDelete(userId: string, bookmarkIds: string[]): Promise<number> {
    const { data, error } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', bookmarkIds)
      .eq('user_id', userId)
      .select('id');

    if (error) throw error;
    return data ? data.length : 0;
  }

  async bulkAddTags(userId: string, bookmarkIds: string[], tagIds: string[]): Promise<number> {
    const { data: validBookmarks } = await supabase
      .from('bookmarks')
      .select('id')
      .in('id', bookmarkIds)
      .eq('user_id', userId);

    if (!validBookmarks || validBookmarks.length === 0) return 0;
    const validBookmarkIds = validBookmarks.map((b: any) => b.id);

    const records: { bookmark_id: string; tag_id: string }[] = [];
    for (const bId of validBookmarkIds) {
      for (const tId of tagIds) {
        records.push({ bookmark_id: bId, tag_id: tId });
      }
    }

    if (records.length === 0) return 0;

    const { error } = await supabase
      .from('bookmark_tags')
      .upsert(records, { onConflict: 'bookmark_id,tag_id' });

    if (error) throw error;
    return validBookmarkIds.length;
  }

  async bulkRemoveTags(userId: string, bookmarkIds: string[], tagIds: string[]): Promise<number> {
    const { data: validBookmarks } = await supabase
      .from('bookmarks')
      .select('id')
      .in('id', bookmarkIds)
      .eq('user_id', userId);

    if (!validBookmarks || validBookmarks.length === 0) return 0;
    const validBookmarkIds = validBookmarks.map((b: any) => b.id);

    const { error } = await supabase
      .from('bookmark_tags')
      .delete()
      .in('bookmark_id', validBookmarkIds)
      .in('tag_id', tagIds);

    if (error) throw error;
    return validBookmarkIds.length;
  }

  async bulkSetTags(userId: string, bookmarkIds: string[], tagIds: string[]): Promise<number> {
    const { data: validBookmarks } = await supabase
      .from('bookmarks')
      .select('id')
      .in('id', bookmarkIds)
      .eq('user_id', userId);

    if (!validBookmarks || validBookmarks.length === 0) return 0;
    const validBookmarkIds = validBookmarks.map((b: any) => b.id);

    // Delete existing tags for these bookmarks
    await supabase
      .from('bookmark_tags')
      .delete()
      .in('bookmark_id', validBookmarkIds);

    if (tagIds.length > 0) {
      const records: { bookmark_id: string; tag_id: string }[] = [];
      for (const bId of validBookmarkIds) {
        for (const tId of tagIds) {
          records.push({ bookmark_id: bId, tag_id: tId });
        }
      }
      await supabase.from('bookmark_tags').insert(records);
    }

    return validBookmarkIds.length;
  }

  async setBookmarkTags(bookmarkId: string, tagIds: string[]): Promise<void> {
    await supabase.from('bookmark_tags').delete().eq('bookmark_id', bookmarkId);

    if (tagIds.length > 0) {
      const inserts = tagIds.map((tagId) => ({
        bookmark_id: bookmarkId,
        tag_id: tagId,
      }));
      await supabase.from('bookmark_tags').insert(inserts);
    }
  }

  async getBookmarkTagIds(bookmarkId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('bookmark_tags')
      .select('tag_id')
      .eq('bookmark_id', bookmarkId);

    if (error || !data) return [];
    return data.map((d: any) => d.tag_id);
  }
}

export const bookmarkRepository = new BookmarkRepository();
