import { Types, Document } from 'mongoose';

export type TTableStatus = 'AVAILABLE' | 'OCCUPIED' | 'UNPAID';

export interface ITable extends Document {
  business_id: Types.ObjectId;
  tableNo: string;
  capacity?: number;
  status: TTableStatus;
  activeOrderId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
