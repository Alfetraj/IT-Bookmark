import {
  bookmarkRepository,
  BookmarkRecord,
  BookmarkFilterQuery,
  PaginatedBookmarkResult,
} from '../repositories/bookmark.repository';
import { tagRepository } from '../repositories/tag.repository';
import { collectionRepository } from '../repositories/collection.repository';
import { metadataService } from './metadata.service';
import { queueManager } from '../config/queue';
import { supabase } from '../config/supabase';

export interface BookmarkTagDto {
  id: string;
  name: string;
  color: string | null;
  slug: string;
}

export interface BookmarkCollectionDto {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  isPublic?: boolean;
}

export interface BookmarkResponseDto {
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  image: string | null;
  notes: string | null;
  domain: string;
  isFavorite: boolean;
  readLater: boolean;
  isArchived: boolean;
  archiveStatus: 'pending' | 'success' | 'failed' | null;
  screenshotPath: string | null;
  pdfPath: string | null;
  readabilityContent: string | null;
  userId: string;
  collectionId: string | null;
  collectionName?: string | null;
  collection?: BookmarkCollectionDto | null;
  tags: BookmarkTagDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ReaderViewResponseDto {
  id: string;
  title: string;
  domain: string;
  url: string;
  content: string;
  readingTimeMinutes: number;
  createdAt: string;
}

export interface CreateBookmarkDto {
  url: string;
  title?: string;
  name?: string;
  description?: string | null;
  notes?: string | null;
  collectionId?: string | null;
  collection?: { id?: string; name?: string } | null;
  tagIds?: string[];
  tags?: (string | { name: string; color?: string })[];
  isFavorite?: boolean;
  pinned?: boolean;
  readLater?: boolean;
  isArchived?: boolean;
}

export interface UpdateBookmarkDto {
  url?: string;
  title?: string;
  name?: string;
  description?: string | null;
  notes?: string | null;
  collectionId?: string | null;
  collection?: { id?: string; name?: string } | null;
  tagIds?: string[];
  tags?: (string | { name: string; color?: string })[];
  removePreviousTags?: boolean;
  isFavorite?: boolean;
  pinned?: boolean;
  readLater?: boolean;
  isArchived?: boolean;
}

export interface PaginatedBookmarkResponseDto {
  bookmarks: BookmarkResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DuplicateUrlError extends Error {
  public existingBookmarkId?: string;
  constructor(message: string, existingBookmarkId?: string) {
    super(message);
    this.name = 'DuplicateUrlError';
    this.existingBookmarkId = existingBookmarkId;
  }
}

const parseDomain = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
};

const getFaviconUrl = (domain: string): string => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

export class BookmarkService {
  private async mapToDto(record: BookmarkRecord, userId: string): Promise<BookmarkResponseDto> {
    const domain = parseDomain(record.url);
    const favicon = record.favicon || getFaviconUrl(domain);

    let collectionName: string | null = null;
    let collectionDto: BookmarkCollectionDto | null = null;

    if (record.collection_id) {
      const col = await collectionRepository.findById(record.collection_id, userId);
      if (col) {
        collectionName = col.name;
        collectionDto = {
          id: col.id,
          name: col.name,
          color: col.color,
          icon: col.icon,
          isPublic: col.is_public,
        };
      }
    }

    const tagIds = await bookmarkRepository.getBookmarkTagIds(record.id);
    const tags: BookmarkTagDto[] = [];
    if (tagIds.length > 0) {
      const { data: tagRecords } = await supabase
        .from('tags')
        .select('*')
        .in('id', tagIds);

      (tagRecords || []).forEach((t: any) => {
        tags.push({
          id: t.id,
          name: t.name,
          color: t.color,
          slug: t.slug,
        });
      });
    }

    return {
      id: record.id,
      url: record.url,
      title: record.title,
      description: record.description,
      favicon,
      image: record.image,
      notes: record.notes,
      domain,
      isFavorite: record.is_favorite,
      readLater: record.read_later,
      isArchived: record.is_archived,
      archiveStatus: record.archive_status,
      screenshotPath: record.screenshot_path,
      pdfPath: record.pdf_path,
      readabilityContent: record.readability_content,
      userId: record.user_id,
      collectionId: record.collection_id,
      collectionName,
      collection: collectionDto,
      tags,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  async getUserBookmarks(userId: string, filters?: BookmarkFilterQuery): Promise<PaginatedBookmarkResponseDto> {
    const paginated = await bookmarkRepository.findByUserId(userId, filters);
    const dtos = await Promise.all(paginated.bookmarks.map((rec) => this.mapToDto(rec, userId)));

    return {
      bookmarks: dtos,
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
    };
  }

  async getBookmarkById(id: string, userId: string): Promise<BookmarkResponseDto | null> {
    const record = await bookmarkRepository.findById(id, userId);
    if (!record) return null;
    return await this.mapToDto(record, userId);
  }

  async getBookmarkReader(id: string, userId: string): Promise<ReaderViewResponseDto | null> {
    const record = await bookmarkRepository.findById(id, userId);
    if (!record) return null;

    if (!record.readability_content) {
      return null;
    }

    const cleanText = record.readability_content.replace(/<[^>]*>?/gm, '');
    const wordCount = cleanText.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return {
      id: record.id,
      title: record.title,
      domain: parseDomain(record.url),
      url: record.url,
      content: record.readability_content,
      readingTimeMinutes,
      createdAt: record.created_at,
    };
  }

  async createBookmark(userId: string, dto: CreateBookmarkDto): Promise<BookmarkResponseDto> {
    let formattedUrl = dto.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Duplicate check
    const existing = await bookmarkRepository.findByUrl(formattedUrl, userId);
    if (existing) {
      throw new DuplicateUrlError('This URL has already been bookmarked.', existing.id);
    }

    // Resolve Collection
    let collectionId = dto.collectionId || dto.collection?.id || null;
    if (!collectionId && dto.collection?.name) {
      // Find or create collection by name
      const userCollections = await collectionRepository.findByUserId(userId);
      const matched = userCollections.find(c => c.name.toLowerCase() === dto.collection!.name!.trim().toLowerCase());
      if (matched) {
        collectionId = matched.id;
      } else {
        const newCol = await collectionRepository.create({
          name: dto.collection.name.trim(),
          user_id: userId,
        });
        collectionId = newCol.id;
      }
    }

    // Resolve Tags
    const resolvedTagIds = await tagRepository.resolveTagIds(userId, dto.tagIds, dto.tags);

    // Fetch Metadata
    const metadata = await metadataService.fetchMetadata(formattedUrl);
    const domain = metadata.domain || parseDomain(formattedUrl);
    const title = (dto.title || dto.name)?.trim() || metadata.title || domain;
    const description = dto.description !== undefined ? dto.description : metadata.description;
    const favicon = metadata.favicon || getFaviconUrl(domain);
    const image = metadata.image || null;

    const isFavorite = dto.isFavorite !== undefined ? dto.isFavorite : (dto.pinned ?? false);

    const record = await bookmarkRepository.create({
      url: formattedUrl,
      title,
      description: description || null,
      notes: dto.notes || null,
      favicon,
      image,
      is_favorite: isFavorite,
      read_later: dto.readLater ?? false,
      is_archived: dto.isArchived ?? false,
      collection_id: collectionId,
      user_id: userId,
    });

    if (resolvedTagIds.length > 0) {
      await bookmarkRepository.setBookmarkTags(record.id, resolvedTagIds);
    }

    // Enqueue archiving task in pg-boss
    queueManager.send('bookmark.archive', {
      bookmarkId: record.id,
      url: formattedUrl,
      userId,
    }).catch(console.error);

    return await this.mapToDto(record, userId);
  }

  async updateBookmark(id: string, userId: string, dto: UpdateBookmarkDto): Promise<BookmarkResponseDto | null> {
    const existing = await bookmarkRepository.findById(id, userId);
    if (!existing) {
      return null;
    }

    let formattedUrl = dto.url?.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let favicon = existing.favicon;
    let urlChanged = false;

    if (formattedUrl && formattedUrl !== existing.url) {
      const duplicate = await bookmarkRepository.findByUrl(formattedUrl, userId);
      if (duplicate && duplicate.id !== id) {
        throw new DuplicateUrlError('This URL has already been bookmarked.', duplicate.id);
      }
      favicon = getFaviconUrl(parseDomain(formattedUrl));
      urlChanged = true;
    }

    // Resolve Collection
    let collectionId = dto.collectionId !== undefined ? dto.collectionId : (dto.collection?.id !== undefined ? dto.collection.id : undefined);
    if (collectionId === undefined && dto.collection?.name) {
      const userCollections = await collectionRepository.findByUserId(userId);
      const matched = userCollections.find(c => c.name.toLowerCase() === dto.collection!.name!.trim().toLowerCase());
      if (matched) {
        collectionId = matched.id;
      } else {
        const newCol = await collectionRepository.create({
          name: dto.collection.name.trim(),
          user_id: userId,
        });
        collectionId = newCol.id;
      }
    }

    const isFavorite = dto.isFavorite !== undefined ? dto.isFavorite : (dto.pinned !== undefined ? dto.pinned : undefined);
    const title = dto.title !== undefined ? dto.title.trim() : (dto.name !== undefined ? dto.name.trim() : undefined);

    const record = await bookmarkRepository.update(id, userId, {
      url: formattedUrl,
      title,
      description: dto.description,
      notes: dto.notes,
      favicon,
      is_favorite: isFavorite,
      read_later: dto.readLater,
      is_archived: dto.isArchived,
      collection_id: collectionId,
      ...(urlChanged ? {
        archive_status: 'pending',
        screenshot_path: null,
        pdf_path: null,
        readability_content: null,
      } : {}),
    });

    if (!record) return null;

    // Handle Tags update
    if (dto.tagIds !== undefined || dto.tags !== undefined) {
      const resolvedTagIds = await tagRepository.resolveTagIds(userId, dto.tagIds, dto.tags);
      if (dto.removePreviousTags) {
        await bookmarkRepository.setBookmarkTags(id, resolvedTagIds);
      } else if (dto.tagIds !== undefined || dto.tags !== undefined) {
        await bookmarkRepository.setBookmarkTags(id, resolvedTagIds);
      }
    }

    // If URL changed, re-enqueue archive job
    if (urlChanged && formattedUrl) {
      queueManager.send('bookmark.archive', {
        bookmarkId: record.id,
        url: formattedUrl,
        userId,
      }).catch(console.error);
    }

    return await this.mapToDto(record, userId);
  }

  async deleteBookmark(id: string, userId: string): Promise<boolean> {
    return bookmarkRepository.delete(id, userId);
  }

  async rearchiveBookmark(id: string, userId: string): Promise<{ message: string; status: string; bookmarkId: string }> {
    const bookmark = await bookmarkRepository.findById(id, userId);
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    await bookmarkRepository.update(id, userId, {
      archive_status: 'pending',
      screenshot_path: null,
      pdf_path: null,
      readability_content: null,
    });

    await queueManager.send('bookmark.archive', {
      bookmarkId: bookmark.id,
      url: bookmark.url,
      userId,
    });

    return {
      message: 'Bookmark is being re-archived',
      status: 'pending',
      bookmarkId: id,
    };
  }

  async bulkUpdate(
    userId: string,
    bookmarkIds: string[],
    action: string,
    payload?: any
  ): Promise<{ total: number; succeeded: number; failed: number }> {
    if (!bookmarkIds || bookmarkIds.length === 0) {
      return { total: 0, succeeded: 0, failed: 0 };
    }

    let succeeded = 0;
    const total = bookmarkIds.length;

    try {
      switch (action) {
        case 'delete':
          succeeded = await bookmarkRepository.bulkDelete(userId, bookmarkIds);
          break;
        case 'favorite':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, { is_favorite: true });
          break;
        case 'unfavorite':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, { is_favorite: false });
          break;
        case 'read_later':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, { read_later: true });
          break;
        case 'unread_later':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, { read_later: false });
          break;
        case 'archive':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, { is_archived: true });
          break;
        case 'unarchive':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, { is_archived: false });
          break;
        case 'move_collection':
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, {
            collection_id: payload?.collectionId || null,
          });
          break;
        case 'add_tags': {
          const resolvedTagIds = await tagRepository.resolveTagIds(userId, payload?.tagIds, payload?.tags);
          if (resolvedTagIds.length > 0) {
            succeeded = await bookmarkRepository.bulkAddTags(userId, bookmarkIds, resolvedTagIds);
          }
          break;
        }
        case 'remove_tags': {
          const resolvedTagIds = await tagRepository.resolveTagIds(userId, payload?.tagIds, payload?.tags);
          if (resolvedTagIds.length > 0) {
            succeeded = await bookmarkRepository.bulkRemoveTags(userId, bookmarkIds, resolvedTagIds);
          }
          break;
        }
        case 'set_tags': {
          const resolvedTagIds = await tagRepository.resolveTagIds(userId, payload?.tagIds, payload?.tags);
          succeeded = await bookmarkRepository.bulkSetTags(userId, bookmarkIds, resolvedTagIds);
          break;
        }
        case 'retry_archive':
        case 'rearchive': {
          succeeded = await bookmarkRepository.bulkUpdate(userId, bookmarkIds, {
            archive_status: 'pending',
          });

          const { data: validBookmarks } = await supabase
            .from('bookmarks')
            .select('id, url')
            .in('id', bookmarkIds)
            .eq('user_id', userId);

          if (validBookmarks) {
            for (const b of validBookmarks) {
              await queueManager.send('bookmark.archive', {
                bookmarkId: b.id,
                url: b.url,
                userId,
              });
            }
          }
          break;
        }
        default:
          throw new Error(`Unsupported bulk action: ${action}`);
      }
    } catch (error) {
      console.error(`Bulk operation ${action} failed:`, error);
      throw error;
    }

    return {
      total,
      succeeded,
      failed: total - succeeded,
    };
  }
}

export const bookmarkService = new BookmarkService();
