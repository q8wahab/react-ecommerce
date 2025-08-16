import reducer, { addCart, delCart, setQty, clearCart } from "./slice";

describe("cart slice (handleCart)", () => {
  test("initial state = []", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state).toEqual([]);
  });

  test("addCart: adds new item with qty=1", () => {
    const next = reducer([], addCart({ id: 1, title: "A", price: 2 }));
    expect(next).toEqual([{ id: 1, title: "A", price: 2, qty: 1 }]);
  });

  test("addCart: increments qty if item exists", () => {
    const prev = [{ id: 1, title: "A", price: 2, qty: 1 }];
    const next = reducer(prev, addCart({ id: 1, title: "A", price: 2 }));
    expect(next[0].qty).toBe(2);
    // تأكد مرجعية جديدة (immutability عبر Immer)
    expect(next).not.toBe(prev);
  });

  test("delCart: decrements qty and removes at 0/1", () => {
    let state = [{ id: 1, price: 2, qty: 2 }];
    state = reducer(state, delCart({ id: 1 }));
    expect(state[0].qty).toBe(1);

    state = reducer(state, delCart({ id: 1 }));
    expect(state).toEqual([]);
  });

  test("setQty: sets numeric qty, clamps to >= 1", () => {
    let state = [{ id: 1, price: 2, qty: 5 }];

    state = reducer(state, setQty({ id: 1, qty: 3 }));
    expect(state[0].qty).toBe(3);

    state = reducer(state, setQty({ id: 1, qty: 0 }));
    expect(state[0].qty).toBe(1);

    state = reducer(state, setQty({ id: 1, qty: "7" }));
    expect(state[0].qty).toBe(7);
  });

  test("clearCart: empties array", () => {
    const state = reducer([{ id: 1, qty: 1 }], clearCart());
    expect(state).toEqual([]);
  });
});
