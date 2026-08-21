import { supabase } from '../config/supabase';

export interface TagRecord {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTagData {
  name: string;
  slug: string;
  color?: string | null;
  user_id: string;
}

export interface UpdateTagData {
  name?: string;
  slug?: string;
  color?: string | null;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'tag';
};

export class TagRepository {
  async findByUserId(userId: string): Promise<TagRecord[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, userId: string): Promise<TagRecord | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByName(name: string, userId: string): Promise<TagRecord | null> {
    const trimmed = name.trim();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', trimmed)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(data: CreateTagData): Promise<TagRecord> {
    const { data: result, error } = await supabase
      .from('tags')
      .insert({
        name: data.name.trim(),
        slug: data.slug || slugify(data.name),
        color: data.color || null,
        user_id: data.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async findOrCreateByName(name: string, userId: string, color?: string | null): Promise<TagRecord> {
    const trimmed = name.trim();
    const existing = await this.findByName(trimmed, userId);
    if (existing) return existing;

    const baseSlug = slugify(trimmed);
    let finalSlug = baseSlug;
    
    // Check if slug is unique for user, if not append random suffix
    const { data: existingSlug } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', finalSlug)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    try {
      return await this.create({
        name: trimmed,
        slug: finalSlug,
        color: color || null,
        user_id: userId,
      });
    } catch (err) {
      // Handle potential race condition
      const retry = await this.findByName(trimmed, userId);
      if (retry) return retry;
      throw err;
    }
  }

  async resolveTagIds(userId: string, tagIds?: string[], tagNames?: (string | { name: string; color?: string })[]): Promise<string[]> {
    const resolvedIds = new Set<string>();

    if (tagIds && tagIds.length > 0) {
      tagIds.forEach(id => {
        if (id && typeof id === 'string') resolvedIds.add(id);
      });
    }

    if (tagNames && tagNames.length > 0) {
      for (const item of tagNames) {
        const tagName = typeof item === 'string' ? item : item.name;
        const color = typeof item === 'object' ? item.color : undefined;
        if (tagName && tagName.trim()) {
          const tag = await this.findOrCreateByName(tagName.trim(), userId, color);
          resolvedIds.add(tag.id);
        }
      }
    }

    return Array.from(resolvedIds);
  }

  async update(id: string, userId: string, data: UpdateTagData): Promise<TagRecord | null> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
    if (data.color !== undefined) updatePayload.color = data.color;

    const { data: result, error } = await supabase
      .from('tags')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return result;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

export const tagRepository = new TagRepository();
