import { tagRepository, TagRecord } from '../repositories/tag.repository';

export interface TagResponseDto {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  bookmarkCount?: number;
}

export interface CreateTagDto {
  name: string;
  color?: string | null;
}

export interface UpdateTagDto {
  name?: string;
  color?: string | null;
}

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export class TagService {
  private mapToDto(record: TagRecord): TagResponseDto {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      color: record.color,
      userId: record.user_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      bookmarkCount: 0, // Aggregation placeholder until bookmarks join table is populated
    };
  }

  async getUserTags(userId: string): Promise<TagResponseDto[]> {
    const records = await tagRepository.findByUserId(userId);
    return records.map((rec) => this.mapToDto(rec));
  }

  async getTagById(id: string, userId: string): Promise<TagResponseDto | null> {
    const record = await tagRepository.findById(id, userId);
    if (!record) return null;
    return this.mapToDto(record);
  }

  async createTag(userId: string, dto: CreateTagDto): Promise<TagResponseDto> {
    const existing = await tagRepository.findByName(dto.name.trim(), userId);
    if (existing) {
      throw new Error(`Tag "${dto.name}" already exists`);
    }

    const slug = generateSlug(dto.name);
    const record = await tagRepository.create({
      name: dto.name.trim(),
      slug,
      color: dto.color,
      user_id: userId,
    });

    return this.mapToDto(record);
  }

  async updateTag(id: string, userId: string, dto: UpdateTagDto): Promise<TagResponseDto | null> {
    const existing = await tagRepository.findById(id, userId);
    if (!existing) {
      return null;
    }

    let slug = existing.slug;
    if (dto.name && dto.name.trim() !== existing.name) {
      const duplicate = await tagRepository.findByName(dto.name.trim(), userId);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Tag "${dto.name}" already exists`);
      }
      slug = generateSlug(dto.name);
    }

    const record = await tagRepository.update(id, userId, {
      name: dto.name ? dto.name.trim() : undefined,
      slug,
      color: dto.color,
    });

    if (!record) return null;
    return this.mapToDto(record);
  }

  async deleteTag(id: string, userId: string): Promise<boolean> {
    const existing = await tagRepository.findById(id, userId);
    if (!existing) {
      return false;
    }

    return await tagRepository.delete(id, userId);
  }
}

export const tagService = new TagService();
