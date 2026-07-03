import { Schema, model } from 'mongoose';
import { IAnnouncement } from './announcement.interface';

const announcementSchema = new Schema<IAnnouncement>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    author:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:    { type: String, required: true, trim: true, maxlength: 120 },
    body:     { type: String, required: true, trim: true, maxlength: 2000 },
    pinned:   { type: Boolean, default: false },
    expiresAt:{ type: Date, default: null },
    readBy:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted:{ type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Most queries: business + recent. Pinned items go first.
announcementSchema.index({ business: 1, pinned: -1, createdAt: -1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
