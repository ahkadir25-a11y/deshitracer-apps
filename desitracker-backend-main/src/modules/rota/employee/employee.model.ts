import { Schema, model } from 'mongoose';
import { IRotaEmployee } from './employee.interface';

const addressSchema = new Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postcode: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const rotaEmployeeSchema = new Schema<IRotaEmployee>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: '' },

    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: addressSchema, default: {} },

    // ✅ role is free-text (no separate Role model)
    role: { type: String, trim: true, default: '' },

    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },

    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    notes: { type: String, default: '' },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unique employee email per business (ignores soft-deleted docs)
rotaEmployeeSchema.index(
  { business: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const RotaEmployee = model<IRotaEmployee>('RotaEmployee', rotaEmployeeSchema);