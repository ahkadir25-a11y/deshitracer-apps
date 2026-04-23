import { Schema, model } from 'mongoose';
import { IRotaRole } from './role.interface';

const rotaRoleSchema = new Schema<IRotaRole>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique role name per business (ignores soft-deleted docs)
rotaRoleSchema.index(
  { business: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const RotaRole = model<IRotaRole>('RotaRole', rotaRoleSchema);
