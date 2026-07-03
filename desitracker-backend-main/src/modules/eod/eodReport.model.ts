import { model, Schema } from 'mongoose';
import { TEODReport } from './eodReport.interface';

const EODReportSchema = new Schema<TEODReport>(
  {
    business: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
    manager: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: Date, required: true, default: Date.now },
    totalSales: { type: Number, required: true, default: 0 },
    totalTablesServed: { type: Number, required: true, default: 0 },
    missingStockNotes: { type: String, default: '' },
    generalNotes: { type: String, default: '' },
    status: { type: String, enum: ['SUBMITTED', 'REVIEWED_BY_OWNER'], default: 'SUBMITTED' },
  },
  { timestamps: true },
);

export const EODReport = model<TEODReport>('EODReport', EODReportSchema);
