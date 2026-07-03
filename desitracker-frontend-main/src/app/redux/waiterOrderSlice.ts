import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SelectedOption {
  optionGroupId: string;
  optionGroupName: string;
  value: string;
}

export interface WaiterOrderItem {
  lineId: string;
  productId: string;
  name: string;
  price?: number;
  quantity: number;
  currency?: string;
  product_options_ids?: any[];
  selectedOptions?: SelectedOption[];
  product_category_id?: string;
  product_category_type?: string;
}

interface WaiterOrderState {
  businessId: string | null;
  userId: string | null;
  items: Record<string, WaiterOrderItem>;
  notes: string;
  tableNo: string;
}

const initialState: WaiterOrderState = {
  businessId: null,
  userId: null,
  items: {},
  notes: "",
  tableNo: "",
};

type AddProductPayload = {
  lineId: string;
  productId: string;
  name: string;
  price?: number;
  currency?: string;
  product_options_ids?: any[];
  selectedOptions?: SelectedOption[];
  product_category_id?: string;
  product_category_type?: string;
};

type LoadExistingOrderPayload = {
  businessId: string;
  userId: string;
  notes?: string;
  tableNo?: string;
  items: WaiterOrderItem[];
};

const waiterOrderSlice = createSlice({
  name: "waiterOrder",
  initialState,
  reducers: {
    setOrderContext: (
      state,
      action: PayloadAction<{ businessId: string; userId: string }>
    ) => {
      state.businessId = action.payload.businessId;
      state.userId = action.payload.userId;
    },

    loadExistingOrder: (
      state,
      action: PayloadAction<LoadExistingOrderPayload>
    ) => {
      const { businessId, userId, notes, tableNo, items } = action.payload;

      state.businessId = businessId;
      state.userId = userId;
      state.notes = notes || "";
      state.tableNo = tableNo || "";
      state.items = {};

      for (const item of items || []) {
        state.items[item.lineId] = {
          lineId: item.lineId,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: Number(item.quantity || 0),
          currency: item.currency,
          product_options_ids: item.product_options_ids ?? [],
          selectedOptions: item.selectedOptions ?? [],
          product_category_id: item.product_category_id,
          product_category_type: item.product_category_type ?? "",
        };
      }
    },

    addProduct: (state, action: PayloadAction<AddProductPayload>) => {
      const {
        lineId,
        productId,
        name,
        price,
        currency,
        product_options_ids,
        selectedOptions,
        product_category_id,
        product_category_type,
      } = action.payload;

      const existing = state.items[lineId];

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items[lineId] = {
          lineId,
          productId,
          name,
          price,
          quantity: 1,
          currency,
          product_options_ids: product_options_ids ?? [],
          selectedOptions: selectedOptions ?? [],
          product_category_id,
          product_category_type: product_category_type ?? "",
        };
      }
    },

    increment: (state, action: PayloadAction<{ lineId: string }>) => {
      const item = state.items[action.payload.lineId];
      if (item) item.quantity += 1;
    },

    decrement: (state, action: PayloadAction<{ lineId: string }>) => {
      const item = state.items[action.payload.lineId];
      if (!item) return;

      item.quantity -= 1;
      if (item.quantity <= 0) delete state.items[action.payload.lineId];
    },

    remove: (state, action: PayloadAction<{ lineId: string }>) => {
      delete state.items[action.payload.lineId];
    },

    clearOrder: (state) => {
      state.items = {};
      state.notes = "";
      state.tableNo = "";
    },

    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    setTableNo: (state, action: PayloadAction<string>) => {
      state.tableNo = action.payload;
    },
  },
});

export const {
  setOrderContext,
  loadExistingOrder,
  addProduct,
  increment,
  decrement,
  remove,
  clearOrder,
  setNotes,
  setTableNo,
} = waiterOrderSlice.actions;

export default waiterOrderSlice.reducer;

export const selectWaiterItemsArray = (state: any) =>
  Object.values(state.waiterOrder.items) as WaiterOrderItem[];

export const selectWaiterTotals = (state: any) => {
  const items = Object.values(state.waiterOrder.items) as WaiterOrderItem[];
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  return { totalQty, subtotal };
};