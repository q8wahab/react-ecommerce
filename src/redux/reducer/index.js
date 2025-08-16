import { combineReducers } from "redux";

// لو ما زلت تستخدم الملف القديم:
import handleCart from "./handleCart";

// إن كنت فعّلت RTK Slice للكارت، يكون:
/// import handleCart from "../cart/slice";

// ✅ أضف الويش ليست
import wishlist from "../wishlist/slice"; // <-- عدّل المسار لو لزم

const rootReducers = combineReducers({
  handleCart,
  wishlist,        // ✅ مهم
});

export default rootReducers;
