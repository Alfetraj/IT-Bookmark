import { collectionRepository, CollectionRecord, CollectionMemberInfo } from '../repositories/collection.repository';
import crypto from 'crypto';

export interface CollectionResponseDto {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string | null;
  parentId: string | null;
  color: string | null;
  icon: string | null;
  iconWeight: string | null;
  userId: string;
  owner?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  members: CollectionMemberInfo[];
  createdAt: string;
  updatedAt: string;
  bookmarkCount: number;
}

export interface CreateCollectionDto {
  name: string;
  description?: string | null;
  isPublic?: boolean;
  parentId?: string | null;
  color?: string | null;
  icon?: string | null;
  iconWeight?: string | null;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string | null;
  isPublic?: boolean;
  parentId?: string | null;
  color?: string | null;
  icon?: string | null;
  iconWeight?: string | null;
}

export class CollectionService {
  private mapToDto(record: CollectionRecord): CollectionResponseDto {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      isPublic: record.is_public,
      shareToken: record.share_token || null,
      parentId: record.parent_id,
      color: record.color,
      icon: record.icon || null,
      iconWeight: record.icon_weight || null,
      userId: record.user_id,
      owner: record.owner || { id: record.user_id, name: null, email: '' },
      members: record.members || [],
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      bookmarkCount: record.bookmarks && record.bookmarks.length > 0 ? record.bookmarks[0].count : 0,
    };
  }

  async getUserCollections(userId: string): Promise<CollectionResponseDto[]> {
    const records = await collectionRepository.findByUserId(userId);
    return records.map((rec) => this.mapToDto(rec));
  }

  async getCollectionById(id: string, userId: string): Promise<CollectionResponseDto | null> {
    const record = await collectionRepository.findById(id, userId);
    if (!record) return null;
    return this.mapToDto(record);
  }

  async createCollection(userId: string, dto: CreateCollectionDto): Promise<CollectionResponseDto> {
    if (dto.parentId) {
      const parent = await collectionRepository.findById(dto.parentId, userId);
      if (!parent) {
        throw new Error('Parent collection not found');
      }
    }

    const record = await collectionRepository.create({
      name: dto.name,
      description: dto.description,
      is_public: dto.isPublic,
      parent_id: dto.parentId,
      color: dto.color,
      icon: dto.icon,
      icon_weight: dto.iconWeight,
      user_id: userId,
    });

    return this.mapToDto(record);
  }

  async updateCollection(id: string, userId: string, dto: UpdateCollectionDto): Promise<CollectionResponseDto | null> {
    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new Error('Collection cannot be its own parent');
      }

      const isDescendant = await this.checkIsDescendant(id, dto.parentId, userId);
      if (isDescendant) {
        throw new Error('Cannot set a descendant collection as parent');
      }

      const parent = await collectionRepository.findById(dto.parentId, userId);
      if (!parent) {
        throw new Error('Parent collection not found');
      }
    }

    const record = await collectionRepository.update(id, userId, {
      name: dto.name,
      description: dto.description,
      is_public: dto.isPublic,
      parent_id: dto.parentId,
      color: dto.color,
      icon: dto.icon,
      icon_weight: dto.iconWeight,
    });

    if (!record) return null;
    return this.mapToDto(record);
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    return await collectionRepository.delete(id, userId);
  }

  private async checkIsDescendant(ancestorId: string, candidateId: string, userId: string): Promise<boolean> {
    let currentId: string | null = candidateId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === ancestorId) return true;
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const node = await collectionRepository.findById(currentId, userId);
      if (!node) break;
      currentId = node.parent_id;
    }

    return false;
  }

  // Sharing & Collaboration methods
  async generateShareLink(id: string, userId: string): Promise<string> {
    const token = crypto.randomBytes(16).toString('hex');
    await collectionRepository.generateShareToken(id, userId, token);
    return token;
  }

  async revokeShareLink(id: string, userId: string): Promise<void> {
    await collectionRepository.revokeShareToken(id, userId);
  }

  async getCollectionByShareToken(token: string): Promise<CollectionResponseDto | null> {
    const record = await collectionRepository.findByShareToken(token);
    if (!record) return null;
    return this.mapToDto(record);
  }

  async getMembers(id: string, userId: string) {
    return await collectionRepository.getMembers(id, userId);
  }

  async addMember(id: string, userId: string, targetUserId: string, role: string) {
    if (role !== 'editor' && role !== 'viewer') {
      throw new Error('Invalid role');
    }
    await collectionRepository.addMember(id, userId, targetUserId, role);
  }

  async removeMember(id: string, userId: string, targetUserId: string) {
    await collectionRepository.removeMember(id, userId, targetUserId);
  }

  async updateMemberRole(id: string, userId: string, targetUserId: string, role: string) {
    if (role !== 'editor' && role !== 'viewer') {
      throw new Error('Invalid role');
    }
    await collectionRepository.updateMemberRole(id, userId, targetUserId, role);
  }
}

export const collectionService = new CollectionService();
