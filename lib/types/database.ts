export type PostKind = 'adoption' | 'lost' | 'rescue' | 'help' | 'event';
export type PostStatus = 'draft' | 'published' | 'closed' | 'removed';

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  accountType: 'person' | 'rescue_organization';
  bio: string | null;
  locality: string | null;
  createdAt: Date;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  kind: PostKind;
  status: PostStatus;
  title: string;
  description: string;
  locality: string | null;
  createdAt: Date;
};
