export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  bookmarkCount?: number;
}
