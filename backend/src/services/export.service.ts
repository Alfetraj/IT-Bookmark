import { supabase } from '../config/supabase';

/**
 * Escapes special characters for safe HTML attribute/content output.
 * Prevents XSS and malformed HTML in Netscape export.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Escapes a URL for use inside an HTML attribute.
 * Encodes double quotes but preserves valid URL characters.
 */
function escapeAttrUrl(url: string): string {
  return url.replace(/"/g, '&quot;').replace(/&(?!amp;|lt;|gt;|quot;)/g, '&amp;');
}

export interface ExportData {
  version: string;
  exportedAt: string;
  collections: ExportCollection[];
  bookmarks: ExportBookmark[];
  tags: ExportTag[];
}

export interface ExportCollection {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_public: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExportBookmark {
  id: string;
  url: string;
  title: string;
  description: string | null;
  notes: string | null;
  is_favorite: boolean;
  read_later: boolean;
  is_archived: boolean;
  collection_id: string | null;
  import_date: string | null;
  created_at: string;
  updated_at: string;
  tagNames?: string[];
  bookmark_tags?: { tag_id: string }[];
}

export interface ExportTag {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export class ExportService {
  /**
   * Fetch export data with explicit column selection.
   * P1-EXP-001: No SELECT * — excludes internal columns like
   * readability_content, search_index, screenshot_path, pdf_path,
   * monolith_path, text_content, archive_status, user_id.
   */
  async getExportData(userId: string): Promise<ExportData> {
    // 1. Fetch Collections (explicit columns, no user_id leaked)
    const { data: collections } = await supabase
      .from('collections')
      .select('id, name, description, color, is_public, parent_id, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    // 2. Fetch Tags (explicit columns)
    const { data: tags } = await supabase
      .from('tags')
      .select('id, name, color, created_at')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    // 3. Fetch Bookmarks with tag associations (explicit columns)
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select(`
        id, url, title, description, notes,
        is_favorite, read_later, is_archived,
        collection_id, import_date,
        created_at, updated_at,
        bookmark_tags ( tag_id )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    return {
      version: '1',
      exportedAt: new Date().toISOString(),
      collections: (collections || []) as ExportCollection[],
      tags: (tags || []) as ExportTag[],
      bookmarks: (bookmarks || []) as ExportBookmark[],
    };
  }

  /**
   * Generate Netscape Bookmark HTML with proper escaping.
   * P1-EXP-002: All titles, URLs, descriptions, tags, and collection
   * names are HTML-escaped to prevent XSS and malformed output.
   */
  generateNetscapeHtml(data: ExportData): string {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL><p>\n`;

    // Map collections
    const collectionsById = new Map<string, any>();
    (data.collections || []).forEach((c) =>
      collectionsById.set(c.id, { ...c, children: [] as any[], bookmarks: [] as any[] })
    );

    // Nest collections
    const rootCollections: any[] = [];
    collectionsById.forEach((c) => {
      if (c.parent_id && collectionsById.has(c.parent_id)) {
        collectionsById.get(c.parent_id).children.push(c);
      } else {
        rootCollections.push(c);
      }
    });

    // Map tags
    const tagsById = new Map<string, string>();
    (data.tags || []).forEach((t) => tagsById.set(t.id, t.name));

    // Assign bookmarks to collections
    const rootBookmarks: any[] = [];
    (data.bookmarks || []).forEach((b) => {
      b.tagNames = (b.bookmark_tags || [])
        .map((bt: any) => tagsById.get(bt.tag_id))
        .filter(Boolean) as string[];
      if (b.collection_id && collectionsById.has(b.collection_id)) {
        collectionsById.get(b.collection_id).bookmarks.push(b);
      } else {
        rootBookmarks.push(b);
      }
    });

    const toUnixTimestamp = (dateStr: string): number =>
      Math.floor(new Date(dateStr).getTime() / 1000);

    const renderBookmarks = (bookmarks: any[], indent: string): string => {
      let out = '';
      bookmarks.forEach((b: any) => {
        const added = toUnixTimestamp(b.import_date || b.created_at);
        const escapedUrl = escapeAttrUrl(b.url || '');
        const escapedTitle = escapeHtml(b.title || b.url || '');
        const tagAttr =
          b.tagNames && b.tagNames.length > 0
            ? ` TAGS="${b.tagNames.map((t: string) => escapeHtml(t)).join(',')}"`
            : '';

        out += `${indent}<DT><A HREF="${escapedUrl}" ADD_DATE="${added}"${tagAttr}>${escapedTitle}</A>\n`;
        if (b.description) {
          out += `${indent}<DD>${escapeHtml(b.description)}\n`;
        }
      });
      return out;
    };

    const renderCollection = (collection: any, indent: string): string => {
      const added = toUnixTimestamp(collection.created_at);
      const escapedName = escapeHtml(collection.name || 'Untitled');
      let out = `${indent}<DT><H3 ADD_DATE="${added}">${escapedName}</H3>\n`;
      out += `${indent}<DL><p>\n`;

      out += renderBookmarks(collection.bookmarks, indent + '    ');

      collection.children.forEach((child: any) => {
        out += renderCollection(child, indent + '    ');
      });

      out += `${indent}</DL><p>\n`;
      return out;
    };

    rootCollections.forEach((c) => {
      html += renderCollection(c, '    ');
    });

    html += renderBookmarks(rootBookmarks, '    ');

    html += `</DL><p>\n`;
    return html;
  }
}

export const exportService = new ExportService();
