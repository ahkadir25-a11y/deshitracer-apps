import { model, Schema } from 'mongoose';
import { TActivityLog } from './activity.interface';

const ActivityLogSchema = new Schema<TActivityLog>(
  {
    business: { type: Schema.Types.ObjectId, required: true, ref: 'Business', index: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'staff' },
    action: { type: String, required: true },
    details: { type: String, default: '' },
    entityType: { type: String, enum: ['ORDER', 'TABLE', 'INVENTORY', 'PAYMENT', 'SETTINGS', 'STAFF', 'EOD'], required: true },
    entityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

// Auto-expire logs after 30 days
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ActivityLog = model<TActivityLog>('ActivityLog', ActivityLogSchema);
