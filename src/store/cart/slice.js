import { createSlice } from "@reduxjs/toolkit";

const initialState = []; // [{ id, title, price, qty, ... }]

const cartSlice = createSlice({
  name: "handleCart", // نخلي الاسم handleCart عشان يبقى نفس مفتاح الحالة
  initialState,
  reducers: {
    addCart(state, action) {
      const item = action.payload;
      const found = state.find((p) => p.id === item.id);
      if (found) {
        found.qty = (found.qty || 1) + 1;
      } else {
        state.push({ ...item, qty: item.qty ? item.qty : 1 });
      }
    },
    delCart(state, action) {
      const item = action.payload;
      const idx = state.findIndex((p) => p.id === item.id);
      if (idx !== -1) {
        const current = state[idx];
        if ((current.qty || 1) > 1) current.qty -= 1;
        else state.splice(idx, 1);
      }
    },
    setQty(state, action) {
      const { id, qty } = action.payload; // qty >= 1
      const found = state.find((p) => p.id === id);
      if (found) found.qty = Math.max(1, Number(qty) || 1);
    },
    clearCart() {
      return [];
    },
  },
});

export const { addCart, delCart, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
