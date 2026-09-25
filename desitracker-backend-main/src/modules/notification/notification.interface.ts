import { Types } from 'mongoose';

// Who a notification is for. Everything used to be business-wide, so staff
// read the owner's alerts and the owner read messages addressed to one staff
// member. `user` addresses exactly one person; `audience` addresses a side.
export type TNotificationAudience = 'ALL' | 'OWNER' | 'STAFF';

// Where "act on this" goes. `screen` is a react-navigation route name, `params`
// its params — the app navigates there directly rather than parsing a URL.
export type TNotificationLink = {
  screen: string;
  params?: Record<string, unknown>;
};

export type TNotification = {
  business: Types.ObjectId;
  user?: Types.ObjectId | null;
  audience: TNotificationAudience;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'SYSTEM';
  link?: TNotificationLink | null;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
