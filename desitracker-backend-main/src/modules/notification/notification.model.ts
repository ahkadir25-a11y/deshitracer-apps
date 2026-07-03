import { Schema, model } from 'mongoose';
import { TNotification } from './notification.interface';

const notificationSchema = new Schema<TNotification>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['LOW_STOCK', 'SYSTEM'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<TNotification>('Notification', notificationSchema);
