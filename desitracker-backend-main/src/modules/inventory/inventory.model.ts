import { model, Schema } from 'mongoose';
import { TIngredient, TStockHistory } from './inventory.interface';

const IngredientSchema = new Schema<TIngredient>(
  {
    business: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
    name: { type: String, required: true },
    category: { type: String, default: 'Other' },
    unit: { type: String, required: true },
    currentQuantity: { type: Number, required: true, default: 0 },
    minThreshold: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const Ingredient = model<TIngredient>('Ingredient', IngredientSchema);

const StockHistorySchema = new Schema<TStockHistory>(
  {
    ingredient: { type: Schema.Types.ObjectId, required: true, ref: 'Ingredient' },
    business: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
    actionType: { type: String, enum: ['ADD', 'DEDUCT'], required: true },
    amount: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true },
);

export const StockHistory = model<TStockHistory>('StockHistory', StockHistorySchema);
