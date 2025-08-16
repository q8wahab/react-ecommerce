import { combineReducers } from "redux";
import handleCart from "../cart/slice";  // ✅ لاحظ المسار

export default combineReducers({
  handleCart,
});
