import { Types } from 'mongoose';

export type TDineInTable = {
  business: Types.ObjectId;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
};

export type TDineInSession = {
  business: Types.ObjectId;
  table: Types.ObjectId;
  order: Types.ObjectId;
  status: 'EATING' | 'PAYMENT_DUE' | 'COMPLETED';
  kitchenStatus: 'NOT_SENT' | 'SENT_TO_KITCHEN' | 'COOKING' | 'READY';
  openedBy: Types.ObjectId;
  closedBy?: Types.ObjectId;
};
