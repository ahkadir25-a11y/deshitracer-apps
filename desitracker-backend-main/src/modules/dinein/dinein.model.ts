import { model, Schema } from 'mongoose';
import { TDineInTable, TDineInSession } from './dinein.interface';

const DineInTableSchema = new Schema<TDineInTable>(
  {
    business: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, required: true, default: 4 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const DineInTable = model<TDineInTable>('DineInTable', DineInTableSchema);

const DineInSessionSchema = new Schema<TDineInSession>(
  {
    business: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
    table: { type: Schema.Types.ObjectId, required: true, ref: 'DineInTable' },
    order: { type: Schema.Types.ObjectId, required: true, ref: 'Order' },
    status: { type: String, enum: ['EATING', 'PAYMENT_DUE', 'COMPLETED'], default: 'EATING' },
    kitchenStatus: { type: String, enum: ['NOT_SENT', 'SENT_TO_KITCHEN', 'COOKING', 'READY'], default: 'NOT_SENT' },
    openedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const DineInSession = model<TDineInSession>('DineInSession', DineInSessionSchema);
