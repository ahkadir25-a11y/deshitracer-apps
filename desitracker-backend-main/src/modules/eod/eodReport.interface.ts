import { Types } from 'mongoose';

export type TEODReport = {
  business: Types.ObjectId;
  manager: Types.ObjectId;
  date: Date;
  totalSales: number;
  totalTablesServed: number;
  missingStockNotes: string;
  generalNotes: string;
  status: 'SUBMITTED' | 'REVIEWED_BY_OWNER';
};
