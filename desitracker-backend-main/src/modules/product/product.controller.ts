import { Request, Response } from 'express';
import * as productService from './product.service';
import { Weekday, DayOffer } from './dayOffer.model';
import { assertOwnsRecord } from '../../utils/lib/businessAccess';
import Product from './product.model';
function validateDiscount(discount: any, res: Response): boolean {
  if (discount === undefined || discount === null) return true;
  const n = Number(discount);
  if (Number.isNaN(n) || n < 0 || n > 100) {
    res.status(400).json({ error: 'discount_percent must be a number between 0 and 100.' });
    return false;
  }
  return true;
}

function validateDiscountWindow(
  startRaw: any,
  endRaw: any,
  res: Response
): { ok: true; start: Date | null; end: Date | null } | { ok: false } {
  // Helper that accepts null/'' and only parses non-empty values
  const parseMaybeDate = (v: any): { value: Date | null; invalid: boolean } => {
    if (v === undefined) return { value: null, invalid: false }; // not provided
    if (v === null || v === "") return { value: null, invalid: false }; // explicitly unset -> allowed
    const d = new Date(v);
    return isNaN(d.getTime()) ? { value: null, invalid: true } : { value: d, invalid: false };
  };

  const { value: start, invalid: startInvalid } = parseMaybeDate(startRaw);
  const { value: end, invalid: endInvalid } = parseMaybeDate(endRaw);

  if (startInvalid) {
    res.status(400).json({ error: 'discount_start must be a valid date or null.' });
    return { ok: false };
  }
  if (endInvalid) {
    res.status(400).json({ error: 'discount_end must be a valid date or null.' });
    return { ok: false };
  }
  if (start && end && end < start) {
    res.status(400).json({ error: 'discount_end must be greater than or equal to discount_start.' });
    return { ok: false };
  }
  return { ok: true, start, end };
}



// Add a new product
const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      product_category_id,
      price,
      description,
      tags,
      images,
      thumbnail,
      user_id,
      business_id,
      currency,

      discount_percent,
      discount_start,
      discount_end,

      // ✅ ADD THIS
      product_options_ids,
    } = req.body;

    if (!validateDiscount(discount_percent, res)) return;
    const win = validateDiscountWindow(discount_start, discount_end, res);
    if ((win as any).ok === false) return;

    const newProduct = await productService.addProduct({
      name,
      price,
      description,
      tags: Array.isArray(tags) ? tags : [],
      images,
      thumbnail,
      user_id,
      business_id,
      currency,
      product_category_id,

      discount_percent,
      discount_start: (win as any).start ?? null,
      discount_end: (win as any).end ?? null,

      // ✅ PASS TO SERVICE
      product_options_ids: Array.isArray(product_options_ids)
        ? product_options_ids
        : [],
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.log("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
};

// Edit
const editProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // The route only proved the caller is *a* business user. Prove this
    // product is theirs before touching it, and never let the body decide
    // which business it belongs to.
    await assertOwnsRecord(req, await Product.findById(productId).select('business_id').lean(), 'Product not found');
    delete updateData.business_id;
    delete updateData.user_id;

    // ❌ This used to early-return and do nothing if images is an array.
    // if (updateData.images && Array.isArray(updateData.images)) return;

    if (!validateDiscount(updateData.discount_percent, res)) return;

    // Validate window only if present in payload
    if ('discount_start' in updateData || 'discount_end' in updateData) {
      const win = validateDiscountWindow(updateData.discount_start, updateData.discount_end, res);
      if ((win as any).ok === false) return;
      updateData.discount_start = (win as any).start ?? null;
      updateData.discount_end = (win as any).end ?? null;
    }

    const updatedProduct = await productService.editProduct(productId, updateData);
    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error: any) {
    // An authorization refusal carries its own status; only genuine faults
    // are a 500.
    const status = Number(error?.statusCode) || 500;
    res.status(status).json({ error: status === 500 ? 'Failed to edit product' : error.message });
  }
};

// Delete a product
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    await assertOwnsRecord(req, await Product.findById(productId).select('business_id').lean(), 'Product not found');
    const result = await productService.deleteProduct(productId);
    res.status(200).json(result);
  } catch (error: any) {
    const status = Number(error?.statusCode) || 500;
    res.status(status).json({ error: status === 500 ? 'Failed to delete product' : error.message });
  }
};

// Get all products by user and business
const getProductsByUserAndBusiness = async (req: Request, res: Response) => {
  try {
    const { user_id, business_id } = req.params;
    const products = await productService.getProductsByUserAndBusiness(user_id, business_id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


// Get all products by user and business
const getProductsCategoryByUserAndBusiness = async (req: Request, res: Response) => {
  try {
    const { user_id, business_id } = req.params;
    const products = await productService.getProductsCategoryByUserAndBusiness(user_id, business_id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get a product by its ID
const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
};

const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params; // e.g. /products/category/:categoryId
    const { user_id, business_id } = (req.query as any) as {
      user_id?: string;
      business_id?: string;
    };
    const products = await productService.getProductsByCategory(
      categoryId,
      user_id,
      business_id,
    );
    res.status(200).json(products);
  } catch (error) {
    console.log('Error fetching products by category:', error);
    res.status(500).json({ error: error });
  }
};

const bulkUpdateDiscount = async (req: Request, res: Response) => {
  try {
    const {
      productIds,
      filters = {},
      discount_percent,
      discount_start,   // NEW optional
      discount_end,     // NEW optional
    }: {
      productIds?: string[];
      filters?: { user_id?: string; business_id?: string; product_category_id?: string };
      discount_percent: number;
      discount_start?: string | Date | null;
      discount_end?: string | Date | null;
    } = req.body;

    if (!validateDiscount(discount_percent, res)) return;

    if ((!productIds || productIds.length === 0) &&
      !filters.user_id && !filters.business_id && !filters.product_category_id) {
      res.status(400).json({
        error: 'Provide either productIds[] or at least one filter (user_id, business_id, product_category_id).',
      });
      return
    }

    // Validate window if provided
    const win = validateDiscountWindow(discount_start, discount_end, res);
    if ((win as any).ok === false) return;

    const result = await productService.bulkUpdateDiscount(
      { productIds, ...filters },
      discount_percent,
      { discount_start: (win as any).start ?? undefined, discount_end: (win as any).end ?? undefined }
    );

    res.status(200).json({
      message: 'Discount updated in bulk',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      discount_percent,
      discount_start: (win as any).start ?? null,
      discount_end: (win as any).end ?? null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to bulk update discount' });
  }
};



// ===== Helpers for day offers =====
function validateDayName(day: any, res: Response): day is string {
  const normalized = productService.normalizeDayName(day);
  if (!normalized) {
    res.status(400).json({ error: 'Invalid day. Use Monday..Sunday (or common abbreviations).' });
    return false;
  }
  return true;
}
function normalizeDayOrFail(day: string): Weekday {
  return productService.normalizeDayName(day)!;
}

function validatePercent(n: any, res: Response): boolean {
  if (Number.isFinite(Number(n)) && Number(n) >= 0 && Number(n) <= 100) return true;
  res.status(400).json({ error: 'discount_percent must be a number between 0 and 100.' });
  return false;
}
function validateDateRange(startRaw: any, endRaw: any, res: Response):
  | { ok: true; start: Date; end: Date | null }
  | { ok: false } {
  const parse = (v: any): { v?: Date | null; bad: boolean } => {
    if (v === undefined) return { v: undefined, bad: true };
    if (v === null || v === '') return { v: null, bad: false };
    const d = new Date(v);
    return isNaN(d.getTime()) ? { v: undefined, bad: true } : { v: d, bad: false };
  };
  const s = parse(startRaw);
  if (s.bad || !s.v) { res.status(400).json({ error: 'start_date is required and must be a valid date.' }); return { ok: false }; }
  const e = parse(endRaw);
  if (endRaw !== undefined && e.bad) { res.status(400).json({ error: 'end_date must be a valid date or null.' }); return { ok: false }; }
  if (e.v && e.v < s.v) { res.status(400).json({ error: 'end_date must be greater than or equal to start_date.' }); return { ok: false }; }
  return { ok: true, start: s.v, end: (e.v ?? null) };
}

// ===== Controllers: Day Offers =====

const createDayOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, business_id, product_category_id, day, discount_percent, start_date, end_date } = req.body;

    if (!user_id || !business_id) { res.status(400).json({ error: 'user_id and business_id are required.' }); return; }
    if (!validateDayName(day, res)) return;
    if (!validatePercent(discount_percent, res)) return;

    const range = validateDateRange(start_date, end_date, res);
    if ((range as any).ok === false) return;

    const doc = await productService.createDayOffer({
      user_id,
      business_id,
      product_category_id,
      day: normalizeDayOrFail(day),
      discount_percent: Number(discount_percent),
      start_date: (range as any).start,
      end_date: (range as any).end,
    });

    res.status(201).json(doc);
  } catch (err: any) {
    if (err?.code === 11000) { res.status(409).json({ error: 'An offer for this weekday already exists for this business.' }); return; }
    res.status(500).json({ error: err?.message || 'Failed to create day offer' });
  }
};

// List
const listDayOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, business_id, city, country } = (req.query as any) as {
      user_id?: string; business_id?: string; city?: string; country?: string;
    };

    const items = await productService.listDayOffers({ user_id, business_id, city, country });
    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch day offers' });
  }
};

// Get by id
const getDayOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const one = await productService.getDayOfferById((req.params.id as string));
    if (!one) { res.status(404).json({ error: 'Day offer not found' }); return; }
    res.status(200).json(one);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch day offer' });
  }
};

// Update
const updateDayOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { day, discount_percent, start_date, end_date } = req.body;

    const updates: any = {};
    if (day !== undefined) {
      if (!validateDayName(day, res)) return;
      updates.day = normalizeDayOrFail(day);
    }
    if (discount_percent !== undefined) {
      if (!validatePercent(discount_percent, res)) return;
      updates.discount_percent = Number(discount_percent);
    }
    if (start_date !== undefined || end_date !== undefined) {
      const range = validateDateRange(
        start_date !== undefined ? start_date : new Date(),
        end_date,
        res
      );
      if ((range as any).ok === false) return;
      updates.start_date = (range as any).start;
      updates.end_date = (range as any).end;
    }
    if (req.body.product_category_id !== undefined) {
      updates.product_category_id = req.body.product_category_id || undefined;
    }

    // Unguarded, this let anyone set another restaurant's day offer to 100%
    // off — the same free-food outcome by a different door.
    await assertOwnsRecord(req, await DayOffer.findById(req.params.id as string).select('business_id').lean(), 'Day offer not found');
    const updated = await productService.updateDayOffer((req.params.id as string), updates);
    if (!updated) { res.status(404).json({ error: 'Day offer not found' }); return; }
    res.status(200).json(updated);
  } catch (err: any) {
    if (err?.code === 11000) { res.status(409).json({ error: 'Another offer with this weekday already exists for this business.' }); return; }
    res.status(500).json({ error: err?.message || 'Failed to update day offer' });
  }
};

// Delete
const deleteDayOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    await assertOwnsRecord(req, await DayOffer.findById(req.params.id as string).select('business_id').lean(), 'Day offer not found');
    const result = await productService.deleteDayOffer((req.params.id as string));
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete day offer' });
  }
};

// Apply today's offer (bulk update products for today only)
const applyDayOfferToday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, business_id, day } = req.body as { user_id: string; business_id: string; day?: string };
    if (!user_id || !business_id) { res.status(400).json({ error: 'user_id and business_id are required.' }); return; }

    let weekday: Weekday;
    if (day) {
      const n = productService.normalizeDayName(day);
      if (!n) { res.status(400).json({ error: 'Invalid day. Use Monday..Sunday (or abbreviations).' }); return; }
      weekday = n;
    } else {
      const now = new Date();
      const idx = now.getDay(); // 0..6 (Sun..Sat)
      const names: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      weekday = names[idx];
    }

    const result = await productService.applyDayOfferToday({ user_id, business_id, day: weekday });
    res.status(200).json({
      message: result.applied ? 'Offer applied for today' : 'No active offer for today',
      day: weekday,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to apply day offer' });
  }
};


// Get most recent active offer for today
const getActiveTodayDayOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business_id, user_id, product_category_id, day } = (req.query as any) as {
      business_id?: string;
      user_id?: string;
      product_category_id?: string;
      day?: string; // optional override
    };

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    let weekday: Weekday;

    if (day) {
      const normalized = productService.normalizeDayName(day);
      if (!normalized) {
        res.status(400).json({ error: "Invalid day. Use Monday..Sunday (or abbreviations)." });
        return;
      }
      weekday = normalized;
    } else {
      const now = new Date();
      const idx = now.getDay(); // 0..6 Sun..Sat
      const names: Weekday[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      weekday = names[idx];
    }

    const offer = await productService.getMostRecentActiveOfferForToday({
      business_id,
      user_id,
      product_category_id,
      day: weekday,
    });

    if (!offer) {
      res.status(200).json({ active: false, day: weekday, offer: null });
      return;
    }

    res.status(200).json({ active: true, day: weekday, offer });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch active offer for today" });
  }
};
export const ProductControllers = {
  addProduct,
  editProduct,
  deleteProduct,
  getProductsByUserAndBusiness,
  getProductsCategoryByUserAndBusiness,
  getProductById,
  getProductsByCategory,
  bulkUpdateDiscount,
  createDayOffer,
  listDayOffers,
  getDayOffer,
  updateDayOffer,
  deleteDayOffer,
  applyDayOfferToday,
  getActiveTodayDayOffer
};
