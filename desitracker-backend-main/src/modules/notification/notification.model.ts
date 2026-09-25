import { Schema, model } from 'mongoose';
import { TNotification } from './notification.interface';

const notificationSchema = new Schema<TNotification>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    // Null means "not addressed to one person" — the audience decides instead.
    // Existing rows have neither field, and both defaults keep them visible to
    // everyone, exactly as they were.
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    audience: {
      type: String,
      enum: ['ALL', 'OWNER', 'STAFF'],
      default: 'ALL',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    // No schema on this — links point at different screens with different
    // params depending on the notification, and Mongoose would otherwise
    // reject whichever param shape it had not seen listed.
    link: {
      type: Schema.Types.Mixed,
      default: null,
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
