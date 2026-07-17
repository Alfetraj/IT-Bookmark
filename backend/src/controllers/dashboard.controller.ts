import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const getStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

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

    if (
      bookmarkResult.error ||
      collectionResult.error ||
      tagResult.error
    ) {
      throw (
        bookmarkResult.error ||
        collectionResult.error ||
        tagResult.error
      );
    }

    res.status(200).json({
      totalBookmarks: bookmarkResult.count ?? 0,
      totalCollections: collectionResult.count ?? 0,
      totalTags: tagResult.count ?? 0,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};