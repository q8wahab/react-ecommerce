import { configureStore } from "@reduxjs/toolkit";
import rootReducers from "./reducer";
import { loadCartState, saveCartState } from "./persist";

// نحمّل السلة من localStorage داخل الحالة الأولية
const preloadedState = {
  handleCart: loadCartState(),
};

const store = configureStore({
  reducer: rootReducers,
  preloadedState,
});

// كل ما تغيّرت الحالة نحفظ السلة في localStorage
store.subscribe(() => {
  const state = store.getState();
  // لو اسم الريديُوسر مختلف عندك غيّر handleCart للاسم الصحيح
  saveCartState(state.handleCart);
});

export default store;
