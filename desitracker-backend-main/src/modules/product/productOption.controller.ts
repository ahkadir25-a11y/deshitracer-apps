import { Request, Response } from "express";
import { canAccessUserScopedData } from '../../utils/lib/businessAccess';
import mongoose from "mongoose";
import ProductOption from "./productOption.model";

type AuthRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
  };
};

// Whose options are being asked for.
//
// This used to read the caller's own id FIRST, which meant a staff member
// could see their employer's options — the list route has no auth, so it used
// the id the app sent — and then get a 404 on every edit or delete, because
// the write routes silently substituted the staff member's own id and looked
// for an option that had never belonged to them. The options were fine; the
// question was wrong.
//
// The request says whose data it wants. Whether the caller may have it is a
// separate question, answered by assertMayActFor below.
const getUserIdFromRequest = (req: AuthRequest): string | null => {
  return (
    req.body?.userId ||
    ((req.query?.userId as any) as string) ||
    req.params?.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
};

// May this caller act on that owner's options?
//
// Admin, the owner themselves, or staff of a business that owner runs — the
// same rule the cleaning and fridge logs already use. Returns true when it has
// already answered the request, so the caller just returns.
const denyIfNotAllowed = async (
  req: AuthRequest,
  res: Response,
  targetUserId: string,
): Promise<boolean> => {
  const caller = (req as any).user;
  // No auth on this route (the read routes) — scoping by the requested id is
  // all there is, exactly as before.
  if (!caller?.id && !caller?._id) return false;
  const allowed = await canAccessUserScopedData(
    caller?.id || caller?._id,
    caller?.role,
    String(targetUserId),
    caller?.email,
  );
  if (!allowed) {
    res.status(403).json({ error: "You are not authorized to change these options" });
    return true;
  }
  return false;
};

// Create a new product option
export const createProductOption = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, options } = req.body;
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    if (await denyIfNotAllowed(req, res, userId)) return;

    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "name is required" });
      return;
    }

    if (!Array.isArray(options) || options.length === 0) {
      res.status(400).json({ error: "options must be a non-empty array" });
      return;
    }

    const cleanedOptions = options
      .map((opt: string) => String(opt).trim())
      .filter(Boolean);

    if (cleanedOptions.length === 0) {
      res.status(400).json({ error: "options must contain valid values" });
      return;
    }

    const newOption = new ProductOption({
      name: name.trim(),
      options: cleanedOptions,
      userId,
    });

    await newOption.save();

    res.status(201).json(newOption);
  } catch (error) {
    console.error("Error creating product option:", error);
    res.status(500).json({ error: "Failed to create product option" });
  }
};

// Get ALL product options by user
export const getProductOptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const options = await ProductOption.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(options);
  } catch (error) {
    console.error("Error fetching product options:", error);
    res.status(500).json({ error: "Failed to fetch product options" });
  }
};

// Get single option by id + userId
export const getSingleProductOption = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { optionId } = req.params;
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(optionId)) {
      res.status(400).json({ error: "Invalid optionId" });
      return;
    }
    if (await denyIfNotAllowed(req, res, userId)) return;


    const option = await ProductOption.findOne({ _id: optionId, userId });

    if (!option) {
      res.status(404).json({ error: "Option not found" });
      return;
    }

    res.status(200).json(option);
  } catch (error) {
    console.error("Error fetching product option:", error);
    res.status(500).json({ error: "Failed to fetch product option" });
  }
};

// Update by id + userId
export const updateProductOption = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { optionId } = req.params;
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(optionId)) {
      res.status(400).json({ error: "Invalid optionId" });
      return;
    }
    if (await denyIfNotAllowed(req, res, userId)) return;


    const updateData: Record<string, any> = {};

    if (req.body.name !== undefined) {
      if (!req.body.name || typeof req.body.name !== "string") {
        res.status(400).json({ error: "name must be a valid string" });
        return;
      }
      updateData.name = req.body.name.trim();
    }

    if (req.body.options !== undefined) {
      if (!Array.isArray(req.body.options) || req.body.options.length === 0) {
        res.status(400).json({ error: "options must be a non-empty array" });
        return;
      }

      const cleanedOptions = req.body.options
        .map((opt: string) => String(opt).trim())
        .filter(Boolean);

      if (cleanedOptions.length === 0) {
        res.status(400).json({ error: "options must contain valid values" });
        return;
      }

      updateData.options = cleanedOptions;
    }

    // never allow changing ownership from update payload
    delete updateData.userId;

    const updatedOption = await ProductOption.findOneAndUpdate(
      { _id: optionId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedOption) {
      res.status(404).json({ error: "Option not found" });
      return;
    }

    res.status(200).json(updatedOption);
  } catch (error) {
    console.error("Error updating product option:", error);
    res.status(500).json({ error: "Failed to update product option" });
  }
};

// Delete by id + userId
export const deleteProductOption = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { optionId } = req.params;
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(optionId)) {
      res.status(400).json({ error: "Invalid optionId" });
      return;
    }
    if (await denyIfNotAllowed(req, res, userId)) return;


    const deletedOption = await ProductOption.findOneAndDelete({
      _id: optionId,
      userId,
    });

    if (!deletedOption) {
      res.status(404).json({ error: "Option not found" });
      return;
    }

    res.status(200).json({ message: "Option deleted successfully" });
  } catch (error) {
    console.error("Error deleting product option:", error);
    res.status(500).json({ error: "Failed to delete product option" });
  }
};