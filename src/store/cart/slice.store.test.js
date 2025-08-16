import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducer";
import { addCart, delCart } from "../../redux/action"; // نفس الاستيراد القديم

test("store integration: add & del via actions re-export", () => {
  const store = configureStore({ reducer: rootReducer, preloadedState: { handleCart: [] } });

  store.dispatch(addCart({ id: 1, price: 2 }));
  expect(store.getState().handleCart).toEqual([{ id: 1, price: 2, qty: 1 }]);

  store.dispatch(addCart({ id: 1, price: 2 }));
  expect(store.getState().handleCart[0].qty).toBe(2);

  store.dispatch(delCart({ id: 1 }));
  expect(store.getState().handleCart[0].qty).toBe(1);
});
