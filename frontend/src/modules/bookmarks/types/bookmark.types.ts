export interface BookmarkTag {
  id: string;
  name: string;
  color: string | null;
  slug: string;
}

export interface Bookmark {
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
  tags: BookmarkTag[];
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkFilters {
  collectionId?: string | null;
  isFavorite?: boolean;
  readLater?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}
