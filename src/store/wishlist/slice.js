import { createSlice } from "@reduxjs/toolkit";

const initialState = []; // [{id, ...}]

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const item = action.payload;
      const idx = state.findIndex((p) => p.id === item.id);
      if (idx !== -1) {
        state.splice(idx, 1); // remove if exists
      } else {
        state.push(item);     // add if not exists
      }
    },
    clearWishlist() {
      return [];
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
