import { configureStore } from "@reduxjs/toolkit";
import rootReducers from "./reducer";
import { loadCartState, saveCartState, loadWishlistState, saveWishlistState } from "./persist";

// نحمّل السلة من localStorage داخل الحالة الأولية
const preloadedState = {
  handleCart: loadCartState(),
  wishlist: loadWishlistState(),              // ✅
};

const store = configureStore({
  reducer: rootReducers,
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveCartState(state.handleCart);
  saveWishlistState(state.wishlist);          // ✅
});

export default store;
