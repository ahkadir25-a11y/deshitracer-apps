import { Schema, model } from 'mongoose';
import { IRotaShift } from './shift.interface';

const rotaShiftSchema = new Schema<IRotaShift>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },

    employee: { type: Schema.Types.ObjectId, ref: 'RotaEmployee', default: null, index: true },

    role: { type: Schema.Types.ObjectId, ref: 'RotaRole', required: true, index: true },

    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },

    breakMinutes: { type: Number, min: 0, default: 0 },
    location: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },

    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'], default: 'DRAFT', index: true },

    coverStatus: {
      type: String,
      enum: ['NORMAL', 'NEEDS_COVER', 'COVERED'],
      default: 'NORMAL',
      index: true,
    },
    originalEmployee: { type: Schema.Types.ObjectId, ref: 'RotaEmployee', default: null },
    coverNote: { type: String, default: '' },

    // Stamped once the 1-hour-before push reminder is sent.
    pushReminderSentAt: { type: Date, default: null },

    ownerMandatedOvertime: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Fast range queries (weekly/daily rota views)
rotaShiftSchema.index({ business: 1, startAt: 1, endAt: 1 });
rotaShiftSchema.index({ employee: 1, startAt: 1, endAt: 1 });

export const RotaShift = model<IRotaShift>('RotaShift', rotaShiftSchema);
