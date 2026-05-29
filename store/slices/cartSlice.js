import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { toast } from "sonner";

const normalizeItem = (item = {}) => ({
  variantId: String(item.variantId || item.id || ""),
  name: item.name || item.productName || "Product",
  price: Number(item.price || 0),
  media: Array.isArray(item.media) ? item.media[0] : item.media || "/placeholder.jpg",
  color: item.color || "",
  size: item.size || "",
  quantity: Math.max(1, Number(item.quantity || 1)),
});

const normalizeItems = (items = []) =>
  Array.isArray(items) ? items.map(normalizeItem).filter((i) => i.variantId) : [];

const findByVariant = (items, variantId) =>
  items.find((i) => String(i.variantId) === String(variantId));

const recalc = (state) => {
  state.totalQuantity = state.items.reduce((a, i) => a + Number(i.quantity || 0), 0);
  state.totalPrice = state.items.reduce(
    (a, i) => a + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );
};

export const fetchCartDB = createAsyncThunk(
  "cart/fetchCartDB",
  async (_, { dispatch, getState }) => {
    const { auth } = getState();
    if (!auth.user) return [];

    const res = await api.get("/api/cart");
    const items = normalizeItems(res.data?.items || []);
    dispatch(setCart(items));
    return items;
  }
);

export const addToCartDB = createAsyncThunk(
  "cart/addToCartDB",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    const { auth } = getState();
    const normalized = normalizeItem(payload);
    const previousItems = getState().cart?.items || [];

    dispatch(addToCart(normalized));

    if (!auth.user) {
      return normalized;
    }

    try {
      const res = await api.post("/api/cart", {
        variantId: normalized.variantId,
        quantity: normalized.quantity,
      });

      const items = normalizeItems(res.data?.items || []);
      dispatch(setCart(items));
      return normalized;
    } catch (err) {
      dispatch(setCart(previousItems));
      toast.error("Cloud sync failed");
      return rejectWithValue(err?.response?.data?.message || "Cloud sync failed");
    }
  }
);

export const updateQtyDB = createAsyncThunk(
  "cart/updateQtyDB",
  async ({ variantId, action }, { dispatch, getState, rejectWithValue }) => {
    const { auth } = getState();
    const previousItems = getState().cart?.items || [];

    if (action === "inc") dispatch(increaseQty(variantId));
    if (action === "dec") dispatch(decreaseQty(variantId));

    if (!auth.user) return { variantId, action };

    try {
      const res = await api.patch("/api/cart", { variantId, action });
      const items = normalizeItems(res.data?.items || []);
      dispatch(setCart(items));
      return { variantId, action };
    } catch (err) {
      dispatch(setCart(previousItems));
      toast.error("Server update failed");
      return rejectWithValue(err?.response?.data?.message || "Server update failed");
    }
  }
);

export const removeItemDB = createAsyncThunk(
  "cart/removeItemDB",
  async (variantId, { dispatch, getState, rejectWithValue }) => {
    const { auth } = getState();
    const previousItems = getState().cart?.items || [];

    dispatch(removeFromCart(variantId));

    if (!auth.user) return variantId;

    try {
      const res = await api.patch("/api/cart", {
        variantId,
        action: "remove",
      });

      const items = normalizeItems(res.data?.items || []);
      dispatch(setCart(items));
      return variantId;
    } catch (err) {
      dispatch(setCart(previousItems));
      toast.error("Failed to sync removal");
      return rejectWithValue(err?.response?.data?.message || "Failed to sync removal");
    }
  }
);

export const clearCartDB = createAsyncThunk(
  "cart/clearCartDB",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const { auth } = getState();
    const previousItems = getState().cart?.items || [];

    dispatch(clearCart());

    if (!auth.user) return true;

    try {
      await api.delete("/api/cart");
      dispatch(setCart([]));
      return true;
    } catch (err) {
      dispatch(setCart(previousItems));
      toast.error("Clear failed on server");
      return rejectWithValue(err?.response?.data?.message || "Clear failed on server");
    }
  }
);

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = normalizeItems(action.payload);
      recalc(state);
    },

    addToCart: (state, action) => {
      const incoming = normalizeItem(action.payload);
      const existing = findByVariant(state.items, incoming.variantId);

      if (existing) {
        existing.quantity = Number(existing.quantity || 0) + incoming.quantity;
      } else {
        state.items.push(incoming);
      }

      recalc(state);
    },

    increaseQty: (state, action) => {
      const item = findByVariant(state.items, action.payload);
      if (item) {
        item.quantity = Number(item.quantity || 0) + 1;
        recalc(state);
      }
    },

    decreaseQty: (state, action) => {
      const item = findByVariant(state.items, action.payload);
      if (!item) return;

      if (Number(item.quantity || 0) > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter((i) => String(i.variantId) !== String(action.payload));
      }

      recalc(state);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => String(i.variantId) !== String(action.payload));
      recalc(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;