import { Types } from 'mongoose';

export interface IAnnouncement {
  business: Types.ObjectId;
  author: Types.ObjectId; // ref: User (owner)
  title: string;
  body: string;
  pinned: boolean;
  expiresAt?: Date | null;
  readBy: Types.ObjectId[]; // user ids who have read this
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
