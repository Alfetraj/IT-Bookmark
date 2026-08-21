export interface CollectionMember {
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

export interface CollectionOwner {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
}

export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isPublic: boolean;
  shareToken?: string | null;
  userId: string;
  owner?: CollectionOwner | null;
  members?: CollectionMember[];
  createdAt: string;
  updatedAt: string;
  bookmarkCount: number;
  color?: string | null;
  icon?: string | null;
  iconWeight?: string | null;
  children?: Collection[];
}