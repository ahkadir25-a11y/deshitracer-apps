import { Schema, model } from 'mongoose';
import { ITable } from './table.interface';

const TableSchema = new Schema<ITable>(
  {
    business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    tableNo: { type: String, required: true },
    capacity: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'UNPAID'],
      default: 'AVAILABLE',
    },
    activeOrderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

// Prevent duplicate table numbers in the same business
TableSchema.index({ business_id: 1, tableNo: 1 }, { unique: true });

export const Table = model<ITable>('Table', TableSchema);
