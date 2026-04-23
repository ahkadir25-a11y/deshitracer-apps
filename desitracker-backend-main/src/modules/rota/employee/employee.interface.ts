import { Types } from 'mongoose';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface IRotaEmployeeAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface IRotaEmployee {
  business: Types.ObjectId;

  firstName: string;
  lastName?: string;

  email: string;
  phone?: string;
  address?: IRotaEmployeeAddress;

  role?: Types.ObjectId; // ref: RotaRole

  status: EmployeeStatus;

  // Optional link to your auth user (if employees can login)
  user?: Types.ObjectId;

  notes?: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
