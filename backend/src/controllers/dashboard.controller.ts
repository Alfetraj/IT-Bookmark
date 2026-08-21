import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const getStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    // 1. Fetch dashboard sections for user
    let { data: sections, error: sectionsError } = await supabase
      .from("dashboard_sections")
      .select("*")
      .eq("user_id", userId)
      .order("order_index", { ascending: true });

    if (sectionsError) throw sectionsError;

    // 2. If no sections, create defaults: STATS, RECENT_LINKS, PINNED_LINKS
    if (!sections || sections.length === 0) {
      const defaultSections = [
        { type: "STATS", order_index: 0, user_id: userId },
        { type: "RECENT_LINKS", order_index: 1, user_id: userId },
        { type: "PINNED_LINKS", order_index: 2, user_id: userId },
      ];

      const { data: newSections, error: insertError } = await supabase
        .from("dashboard_sections")
        .insert(defaultSections)
        .select("*")
        .order("order_index", { ascending: true });

      if (insertError) throw insertError;
      sections = newSections;
    }

    // 3. Fetch global stats
    const [
      bookmarkResult,
      collectionResult,
      tagResult,
    ] = await Promise.all([
      supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("tags")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    // 4. Fetch recent links (limit 10)
    const { data: recentLinks, error: recentError } = await supabase
      .from("bookmarks")
      .select(`
        *,
        collections(name),
        bookmark_tags(
          tags(id, name, color, slug)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // 5. Fetch pinned links (is_favorite = true)
    const { data: pinnedLinks, error: pinnedError } = await supabase
      .from("bookmarks")
      .select(`
        *,
        collections(name),
        bookmark_tags(
          tags(id, name, color, slug)
        )
      `)
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (pinnedError) throw pinnedError;

    // Helper to format bookmark data (mirroring bookmark.repository)
    const mapBookmarkData = (row: any) => {
      const bTags = row.bookmark_tags || [];
      const tagList = bTags.map((bt: any) => bt.tags).filter(Boolean);
      return {
        id: row.id,
        url: row.url,
        title: row.title,
        description: row.description,
        favicon: row.favicon,
        image: row.image,
        notes: row.notes,
        isArchived: row.is_archived,
        isFavorite: row.is_favorite,
        readLater: row.read_later,
        archiveStatus: row.archive_status,
        screenshotPath: row.screenshot_path,
        pdfPath: row.pdf_path,
        readabilityContent: row.readability_content,
        userId: row.user_id,
        collectionId: row.collection_id,
        collectionName: row.collections ? row.collections.name : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        tags: tagList,
      };
    };

    res.status(200).json({
      sections: sections || [],
      stats: {
        totalBookmarks: bookmarkResult.count ?? 0,
        totalCollections: collectionResult.count ?? 0,
        totalTags: tagResult.count ?? 0,
      },
      recentLinks: (recentLinks || []).map(mapBookmarkData),
      pinnedLinks: (pinnedLinks || []).map(mapBookmarkData),
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};