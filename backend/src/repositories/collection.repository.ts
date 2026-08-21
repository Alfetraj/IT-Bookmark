import { supabase } from '../config/supabase';

export interface CollectionMemberInfo {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string | null;
  };
}

export interface CollectionRecord {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token?: string | null;
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  icon_weight: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  bookmarks?: [{ count: number }];
  members?: CollectionMemberInfo[];
  owner?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CreateCollectionData {
  name: string;
  description?: string | null;
  is_public?: boolean;
  parent_id?: string | null;
  color?: string | null;
  icon?: string | null;
  icon_weight?: string | null;
  user_id: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string | null;
  is_public?: boolean;
  parent_id?: string | null;
  color?: string | null;
  icon?: string | null;
  icon_weight?: string | null;
}

export class CollectionRepository {
  async findByUserId(userId: string): Promise<CollectionRecord[]> {
    // 1. Fetch owned collections
    const { data: owned, error: ownedError } = await supabase
      .from('collections')
      .select('*, bookmarks(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    // 2. Fetch shared collections where user is a member
    const { data: shared, error: sharedError } = await supabase
      .from('collection_members')
      .select('collections(*, bookmarks(count))')
      .eq('user_id', userId);

    if (sharedError) throw sharedError;

    const sharedCollections = (shared || [])
      .map((s: any) => s.collections)
      .flat()
      .filter(Boolean) as CollectionRecord[];

    // Merge and deduplicate
    const all = [...(owned || []), ...sharedCollections];
    const unique = Array.from(new Map(all.map((item) => [item.id, item])).values());
    const sorted = unique.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // 3. Attach member details and owner info
    const collectionIds = sorted.map((c) => c.id);
    const ownerIds = Array.from(new Set(sorted.map((c) => c.user_id)));

    if (collectionIds.length > 0) {
      // Fetch all members
      const { data: allMembers } = await supabase
        .from('collection_members')
        .select('id, collection_id, user_id, role, users(id, name, email)')
        .in('collection_id', collectionIds);

      // Fetch all owners
      const { data: owners } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', ownerIds);

      const ownerMap = new Map((owners || []).map((u: any) => [u.id, u]));

      const membersByCollection = new Map<string, CollectionMemberInfo[]>();
      (allMembers || []).forEach((m: any) => {
        const list = membersByCollection.get(m.collection_id) || [];
        list.push({
          id: m.id,
          userId: m.user_id,
          role: m.role,
          user: {
            id: m.users?.id || m.user_id,
            name: m.users?.name || null,
            email: m.users?.email || '',
          },
        });
        membersByCollection.set(m.collection_id, list);
      });

      sorted.forEach((col) => {
        col.members = membersByCollection.get(col.id) || [];
        col.owner = ownerMap.get(col.user_id) || { id: col.user_id, name: null, email: '' };
      });
    }

    return sorted;
  }

  async findById(id: string, userId: string): Promise<CollectionRecord | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*, bookmarks(count)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Fetch members
    const { data: members } = await supabase
      .from('collection_members')
      .select('id, user_id, role, users(id, name, email)')
      .eq('collection_id', id);

    const isOwner = data.user_id === userId;
    const isMember = (members || []).some((m: any) => m.user_id === userId);

    if (!isOwner && !isMember && !data.is_public) {
      return null;
    }

    // Fetch owner
    const { data: owner } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', data.user_id)
      .maybeSingle();

    data.members = (members || []).map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      role: m.role,
      user: {
        id: m.users?.id || m.user_id,
        name: m.users?.name || null,
        email: m.users?.email || '',
      },
    }));

    data.owner = owner || { id: data.user_id, name: null, email: '' };

    return data;
  }

  async create(data: CreateCollectionData): Promise<CollectionRecord> {
    const { data: result, error } = await supabase
      .from('collections')
      .insert({
        name: data.name,
        description: data.description || null,
        is_public: data.is_public ?? false,
        parent_id: data.parent_id || null,
        color: data.color || null,
        icon: data.icon || null,
        icon_weight: data.icon_weight || null,
        user_id: data.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(id: string, userId: string, data: UpdateCollectionData): Promise<CollectionRecord | null> {
    const collection = await this.findById(id, userId);
    if (!collection) return null;

    const isOwner = collection.user_id === userId;
    const isEditor = collection.members?.some(
      (m: any) => m.userId === userId && (m.role === 'editor' || m.role === 'owner')
    );

    if (!isOwner && !isEditor) {
      throw new Error('Forbidden: You do not have permission to update this collection');
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.is_public !== undefined) updatePayload.is_public = data.is_public;
    if (data.parent_id !== undefined) updatePayload.parent_id = data.parent_id;
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.icon_weight !== undefined) updatePayload.icon_weight = data.icon_weight;

    const { data: result, error } = await supabase
      .from('collections')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return result;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const collection = await this.findById(id, userId);
    if (!collection || collection.user_id !== userId) {
      return false;
    }

    const { error } = await supabase.from('collections').delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  async findChildren(parentId: string, userId: string): Promise<CollectionRecord[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*, bookmarks(count)')
      .eq('parent_id', parentId);

    if (error) throw error;

    const accessible = [];
    for (const child of data || []) {
      const rec = await this.findById(child.id, userId);
      if (rec) accessible.push(child);
    }

    return accessible;
  }

  // Sharing methods
  async generateShareToken(id: string, userId: string, token: string): Promise<string> {
    const collection = await this.findById(id, userId);
    if (!collection || collection.user_id !== userId) {
      throw new Error('Forbidden');
    }

    const { error } = await supabase
      .from('collections')
      .update({ share_token: token })
      .eq('id', id);

    if (error) throw error;
    return token;
  }

  async revokeShareToken(id: string, userId: string): Promise<void> {
    const collection = await this.findById(id, userId);
    if (!collection || collection.user_id !== userId) {
      throw new Error('Forbidden');
    }

    const { error } = await supabase
      .from('collections')
      .update({ share_token: null })
      .eq('id', id);

    if (error) throw error;
  }

  async findByShareToken(token: string): Promise<CollectionRecord | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*, bookmarks(count)')
      .eq('share_token', token)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Member management
  async getMembers(id: string, userId: string): Promise<any[]> {
    const collection = await this.findById(id, userId);
    if (!collection) throw new Error('Not found');

    const { data, error } = await supabase
      .from('collection_members')
      .select('id, user_id, role, users(name, email)')
      .eq('collection_id', id);

    if (error) throw error;
    return data || [];
  }

  async addMember(id: string, userId: string, targetUserId: string, role: string): Promise<void> {
    const collection = await this.findById(id, userId);
    if (!collection || collection.user_id !== userId) {
      throw new Error('Forbidden: Only owner can add members');
    }

    const { error } = await supabase.from('collection_members').insert({
      collection_id: id,
      user_id: targetUserId,
      role,
    });

    if (error) throw error;
  }

  async removeMember(id: string, userId: string, targetUserId: string): Promise<void> {
    const collection = await this.findById(id, userId);
    if (!collection || collection.user_id !== userId) {
      throw new Error('Forbidden');
    }

    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('collection_id', id)
      .eq('user_id', targetUserId);

    if (error) throw error;
  }

  async updateMemberRole(id: string, userId: string, targetUserId: string, role: string): Promise<void> {
    const collection = await this.findById(id, userId);
    if (!collection || collection.user_id !== userId) {
      throw new Error('Forbidden');
    }

    const { error } = await supabase
      .from('collection_members')
      .update({ role })
      .eq('collection_id', id)
      .eq('user_id', targetUserId);

    if (error) throw error;
  }
}

export const collectionRepository = new CollectionRepository();
