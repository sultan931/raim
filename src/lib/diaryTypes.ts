export type PrivacyMode = 'mine' | 'parent';

export type DiaryMessage = {
  id: string;
  role: 'child' | 'buddy';
  text: string;
  privacy: PrivacyMode;
  createdAt: string;
  audioId?: string;
};

export type BuddyReply = {
  text: string;
  parentHint: string;
};
