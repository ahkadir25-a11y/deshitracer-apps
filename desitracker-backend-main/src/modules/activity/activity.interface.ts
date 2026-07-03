import { Types } from 'mongoose';

export type TActivityLog = {
  business: Types.ObjectId;
  user: Types.ObjectId;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  entityType: 'ORDER' | 'TABLE' | 'INVENTORY' | 'PAYMENT' | 'SETTINGS' | 'STAFF' | 'EOD';
  entityId?: Types.ObjectId;
};
