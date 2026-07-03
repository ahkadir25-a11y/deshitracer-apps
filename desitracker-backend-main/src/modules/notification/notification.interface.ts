import { Types } from 'mongoose';

export type TNotification = {
  business: Types.ObjectId;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'SYSTEM';
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
