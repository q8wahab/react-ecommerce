import { combineReducers } from "redux";
import handleCart from "../cart/slice";  // ✅ لاحظ المسار
import wishlist from "../wishlist/slice"; // إذا عندك ريديوسر آخر
import auth from "../auth/slice"; // ✅ Auth reducer


export default combineReducers({
  handleCart,
  wishlist,
  auth,   
});
