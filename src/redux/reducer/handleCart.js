// Retrieve initial state from localStorage if available
const getInitialCart = () => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : [];
};

const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
};

const handleCart = (state = getInitialCart(), action) => {
  const product = action.payload;

  switch (action.type) {
    case "ADDITEM": {
      const exist = state.find((x) => x.id === product.id);
      const updatedCart = exist
        ? state.map((x) =>
            x.id === product.id ? { ...x, qty: x.qty + 1 } : x
          )
        : [...state, { ...product, qty: 1 }];
      return saveCart(updatedCart);
    }

    case "DELITEM": {
      const exist = state.find((x) => x.id === product.id);
      if (!exist) return state; // حارس احتياطي
      const updatedCart =
        exist.qty === 1
          ? state.filter((x) => x.id !== exist.id)
          : state.map((x) =>
              x.id === product.id ? { ...x, qty: x.qty - 1 } : x
            );
      return saveCart(updatedCart);
    }

    case "CLEARCART": {
      return saveCart([]); // يفرّغ السلة + يحدّث localStorage
    }

    default:
      return state;
  }
};

export default handleCart;
