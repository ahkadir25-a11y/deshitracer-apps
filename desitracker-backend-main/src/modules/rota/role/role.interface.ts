import { Types } from 'mongoose';

export interface IRotaRole {
  business: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
