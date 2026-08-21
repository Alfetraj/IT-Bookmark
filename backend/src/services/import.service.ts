import * as cheerio from 'cheerio';
import { decode } from 'he';
import { supabase } from '../config/supabase';
import { queueManager } from '../config/queue';
import { logger } from '../utils/logger';

// Field length limits (matching Linkwarden 2.16.1 behavior)
const MAX_URL_LENGTH = 2047;
const MAX_TITLE_LENGTH = 254;
const MAX_DESCRIPTION_LENGTH = 254;
const MAX_COLLECTION_NAME_LENGTH = 254;
const MAX_TAG_NAME_LENGTH = 49;

// Only allow safe URL schemes
const ALLOWED_SCHEMES = /^https?:\/\//i;

/**
 * Slugify a tag name for the slug column.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'tag';
}

/**
 * Escapes HTML entities in a string for safe HTML output.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ImportResult {
  totalProcessed: number;
  bookmarksCreated: number;
  bookmarksSkipped: number;
  collectionsCreated: number;
  errors: string[];
}

export class ImportService {
  /**
   * Parse and import a Netscape HTML bookmark file.
   *
   * Fixes applied from Phase 12 audit:
   * - P0-IMP-001: Uses queueManager.send() (not enqueue)
   * - P1-SEC-002: Blocks javascript:, data:, file:, vbscript: schemes
   * - P1-IMP-002: Imports tags from TAGS attribute
   * - P1-IMP-003: Imports descriptions from <DD> elements
   * - P1-IMP-004: Imports ADD_DATE as import_date
   * - P2-IMP-006: Decodes HTML entities in URLs
   * - P2-IMP-007: Truncates all fields to safe lengths
   * - P2-IMP-008: Skips bookmarks with invalid URLs
   * - P2-IMP-009: Falls back to "Untitled Collection" for empty folder names
   * - P3-IMP-010: Creates "Imports" collection for root-level bookmarks
   */
  async importHtml(userId: string, htmlContent: string): Promise<ImportResult> {
    const $ = cheerio.load(htmlContent);

    const result: ImportResult = {
      totalProcessed: 0,
      bookmarksCreated: 0,
      bookmarksSkipped: 0,
      collectionsCreated: 0,
      errors: [],
    };

    // Find the first top-level <DL>
    const topLevelDl = $('dl').first();

    if (!topLevelDl.length) {
      throw new Error('Invalid HTML format. Could not find bookmark list.');
    }

    // Cache for tags: tagName → tagId (avoid repeated DB lookups)
    const tagCache = new Map<string, string>();

    /**
     * Find or create a tag by name, using the cache.
     */
    const findOrCreateTag = async (tagName: string): Promise<string | null> => {
      const trimmed = tagName.trim().slice(0, MAX_TAG_NAME_LENGTH);
      if (!trimmed) return null;

      // Check cache first
      if (tagCache.has(trimmed)) {
        return tagCache.get(trimmed)!;
      }

      // Check DB
      const { data: existing } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', userId)
        .eq('name', trimmed)
        .maybeSingle();

      if (existing) {
        tagCache.set(trimmed, existing.id);
        return existing.id;
      }

      // Create new tag
      const slug = slugify(trimmed);
      const { data: created, error } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          name: trimmed,
          slug,
        })
        .select('id')
        .single();

      if (error) {
        logger.error(`Failed to create tag "${trimmed}":`, error);
        return null;
      }

      tagCache.set(trimmed, created.id);
      return created.id;
    };

    /**
     * Find or create a collection by name and parent.
     */
    const findOrCreateCollection = async (
      name: string,
      parentId: string | null
    ): Promise<string | null> => {
      // P2-IMP-009: Fallback for empty folder names
      let safeName = name.trim().slice(0, MAX_COLLECTION_NAME_LENGTH);
      if (!safeName) {
        safeName = 'Untitled Collection';
      }

      // Check if collection with same name and parent exists
      let query = supabase
        .from('collections')
        .select('id')
        .eq('user_id', userId)
        .eq('name', safeName);

      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        return existing.id;
      }

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name: safeName,
          parent_id: parentId,
        })
        .select('id')
        .single();

      if (error) {
        logger.error(`Error creating collection "${safeName}":`, error);
        result.errors.push(`Failed to create collection: ${safeName}`);
        return null;
      }

      result.collectionsCreated++;
      return data.id;
    };

    /**
     * Recursively process a <DL> element and its children.
     */
    const processDl = async (dlElement: any, parentId: string | null = null) => {
      const children = $(dlElement).children();

      for (let i = 0; i < children.length; i++) {
        const el = children[i];

        if (el.tagName.toLowerCase() === 'dt') {
          const h3 = $(el).children('h3').first();
          const a = $(el).children('a').first();

          if (h3.length > 0) {
            // ---- FOLDER ----
            const folderName = h3.text();
            const collectionId = await findOrCreateCollection(folderName, parentId);

            if (collectionId) {
              // Check if DL is inside this DT (some exports nest it)
              const nestedDl = $(el).children('dl').first();
              if (nestedDl.length > 0) {
                await processDl(nestedDl, collectionId);
              } else {
                // Check if DL is the next sibling (standard Netscape format)
                const nextNode = $(el).next();
                if (nextNode.length && nextNode[0].tagName?.toLowerCase() === 'dl') {
                  await processDl(nextNode, collectionId);
                  i++; // Skip processing the DL again in the main loop
                }
              }
            }
          } else if (a.length > 0) {
            // ---- BOOKMARK ----
            result.totalProcessed++;

            // P2-IMP-006: Decode HTML entities in URL
            const rawHref = a.attr('href') || '';
            const url = decode(rawHref).trim().slice(0, MAX_URL_LENGTH);

            // P1-SEC-002: Block dangerous URL schemes
            if (!url || !ALLOWED_SCHEMES.test(url)) {
              result.bookmarksSkipped++;
              if (url) {
                result.errors.push(`Skipped unsafe/invalid URL: ${url.slice(0, 100)}`);
              }
              continue;
            }

            // P2-IMP-008: Validate URL structure
            try {
              new URL(url);
            } catch {
              result.bookmarksSkipped++;
              result.errors.push(`Skipped malformed URL: ${url.slice(0, 100)}`);
              continue;
            }

            // P2-IMP-007: Truncate title
            const title = (a.text() || url).trim().slice(0, MAX_TITLE_LENGTH);
            const icon = a.attr('icon') || null;

            // P1-IMP-003: Extract description from <DD> sibling
            let description: string | null = null;
            const ddSibling = $(el).next('dd');
            if (ddSibling.length > 0) {
              description = ddSibling.text().trim().slice(0, MAX_DESCRIPTION_LENGTH) || null;
            }

            // P1-IMP-004: Extract ADD_DATE
            let importDate: string | null = null;
            const addDateRaw = a.attr('add_date') || a.attr('ADD_DATE');
            if (addDateRaw) {
              const timestamp = Number(addDateRaw);
              if (Number.isFinite(timestamp) && timestamp > 0) {
                importDate = new Date(timestamp * 1000).toISOString();
              }
            }

            // P1-IMP-002: Extract tags from TAGS attribute
            const tagsRaw = a.attr('tags') || a.attr('TAGS') || '';
            const tagNames = tagsRaw
              .split(',')
              .map((t: string) => decode(t).trim())
              .filter((t: string) => t.length > 0);

            // Determine the collection for this bookmark
            let bookmarkCollectionId = parentId;

            // P3-IMP-010: Root-level bookmarks go into "Imports" collection
            if (!bookmarkCollectionId) {
              bookmarkCollectionId = await findOrCreateCollection('Imports', null);
            }

            // Prevent duplicates (existing behavior, retained)
            const { data: existingBkmk } = await supabase
              .from('bookmarks')
              .select('id')
              .eq('user_id', userId)
              .eq('url', url)
              .maybeSingle();

            if (existingBkmk) {
              result.bookmarksSkipped++;
              continue;
            }

            // Insert bookmark
            const insertPayload: Record<string, any> = {
              user_id: userId,
              collection_id: bookmarkCollectionId,
              url,
              title,
              description,
              favicon: icon,
              import_date: importDate,
            };

            const { data: newBookmark, error: insertError } = await supabase
              .from('bookmarks')
              .insert(insertPayload)
              .select('id')
              .single();

            if (insertError) {
              logger.error(`Failed to insert bookmark ${url}:`, insertError);
              result.errors.push(`Failed to insert: ${url.slice(0, 100)}`);
              continue;
            }

            result.bookmarksCreated++;

            // Link tags to bookmark
            if (tagNames.length > 0 && newBookmark) {
              for (const tagName of tagNames) {
                const tagId = await findOrCreateTag(tagName);
                if (tagId) {
                  const { error: linkError } = await supabase
                    .from('bookmark_tags')
                    .insert({
                      bookmark_id: newBookmark.id,
                      tag_id: tagId,
                    });
                  if (linkError) {
                    logger.error(`Failed to link tag "${tagName}" to bookmark:`, linkError);
                  }
                }
              }
            }

            // P0-IMP-001: Enqueue archive job (using .send(), not .enqueue())
            if (newBookmark) {
              await queueManager.send('bookmark.archive', {
                bookmarkId: newBookmark.id,
                url,
                userId,
              }).catch((err: any) => {
                logger.error(`Failed to enqueue archive for ${url}:`, err);
              });
            }
          }
        }
      }
    };

    await processDl(topLevelDl);
    return result;
  }
}

export const importService = new ImportService();
