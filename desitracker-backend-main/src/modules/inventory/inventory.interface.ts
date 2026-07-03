import { Types } from 'mongoose';

export type TIngredient = {
  business: Types.ObjectId;
  name: string;
  category?: string;
  unit: string;
  currentQuantity: number;
  minThreshold: number;
};

export type TStockHistory = {
  ingredient: Types.ObjectId;
  business: Types.ObjectId;
  actionType: 'ADD' | 'DEDUCT';
  amount: number;
  user: Types.ObjectId;
  notes?: string;
};
