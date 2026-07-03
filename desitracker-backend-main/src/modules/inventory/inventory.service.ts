import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { Ingredient, StockHistory } from './inventory.model';
import { TIngredient } from './inventory.interface';
import { NotificationServices } from '../notification/notification.service';
import { emitToBusiness } from '../../utils/socket';

const createIngredient = async (payload: TIngredient) => {
  const result = await Ingredient.create(payload);
  emitToBusiness((payload as any).business, 'inventory_updated', result);
  return result;
};

const getIngredientsByBusiness = async (businessId: string) => {
  const result = await Ingredient.find({ business: businessId });
  return result;
};

const adjustStock = async (
  ingredientId: string,
  businessId: string,
  actionType: 'ADD' | 'DEDUCT',
  amount: number,
  notes: string,
  decodedUser: JwtPayload
) => {
  // Reject non-positive / non-finite amounts — a negative DEDUCT would otherwise
  // INCREASE stock and corrupt the ledger.
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    throw new AppError(400, 'Amount must be a positive number');
  }

  // Scope the lookup to the caller's business — never mutate another tenant's
  // ingredient by id (authenticated IDOR).
  const ingredient = await Ingredient.findOne({ _id: ingredientId, business: businessId });
  if (!ingredient) {
    throw new AppError(404, 'Ingredient not found');
  }

  const prevQuantity = ingredient.currentQuantity;
  let updatedIngredient;

  if (actionType === 'ADD') {
    // Atomic increment — no read-modify-write race.
    updatedIngredient = await Ingredient.findOneAndUpdate(
      { _id: ingredientId, business: businessId },
      { $inc: { currentQuantity: amt } },
      { new: true },
    );
  } else {
    // Atomic conditional decrement: only succeeds if enough stock remains,
    // which prevents concurrent deductions from overselling.
    updatedIngredient = await Ingredient.findOneAndUpdate(
      { _id: ingredientId, business: businessId, currentQuantity: { $gte: amt } },
      { $inc: { currentQuantity: -amt } },
      { new: true },
    );
    if (!updatedIngredient) {
      throw new AppError(
        400,
        `You only have ${prevQuantity} ${ingredient.unit} in stock. You cannot deduct ${amt} ${ingredient.unit}.`,
      );
    }
  }

  const newQuantity = updatedIngredient!.currentQuantity;
  const wasLowStock = prevQuantity <= ingredient.minThreshold;
  const isLowStockNow = newQuantity <= ingredient.minThreshold;

  if (!wasLowStock && isLowStockNow) {
    await NotificationServices.createNotification({
      business: businessId as any,
      title: 'Low Stock Alert',
      message: `${ingredient.name} dropped to ${newQuantity.toFixed(2)} ${ingredient.unit} (Min: ${ingredient.minThreshold}).`,
      type: 'LOW_STOCK'
    });
  }

  await StockHistory.create({
    ingredient: ingredientId,
    business: businessId,
    actionType,
    amount: amt,
    user: decodedUser.id,
    notes
  });

  emitToBusiness(businessId, 'inventory_updated', updatedIngredient);

  return updatedIngredient;
};

const getStockHistory = async (businessId: string) => {
  const result = await StockHistory.find({ business: businessId })
    .populate('ingredient', 'name unit')
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  return result;
};

const updateIngredient = async (ingredientId: string, payload: Partial<TIngredient>) => {
  const result = await Ingredient.findByIdAndUpdate(ingredientId, payload, { new: true });
  if (!result) {
    throw new AppError(404, 'Ingredient not found');
  }
  return result;
};

const deleteIngredient = async (ingredientId: string) => {
  const result = await Ingredient.findByIdAndDelete(ingredientId);
  if (!result) {
    throw new AppError(404, 'Ingredient not found');
  }
  // Optional: delete associated StockHistory if needed
  await StockHistory.deleteMany({ ingredient: ingredientId });
  return result;
};

export const InventoryServices = {
  createIngredient,
  getIngredientsByBusiness,
  adjustStock,
  getStockHistory,
  updateIngredient,
  deleteIngredient
};
