import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductOption from "./productOption.model";

type AuthRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
  };
};

const getUserIdFromRequest = (req: AuthRequest): string | null => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.body?.userId ||
    (req.query?.userId as string) ||
    req.params?.userId ||
    null
  );
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