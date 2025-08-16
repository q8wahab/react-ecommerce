import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Footer, Navbar } from "../components";
import { formatPrice } from "../utils/format";
import { addCart } from "../redux/action";                 // نفس استيرادك المعتاد
import { toggleWishlist, clearWishlist } from "../store/wishlist/slice"; // من السلايس
import toast from "react-hot-toast";

const Wishlist = () => {
  const wishlist = useSelector((s) => s.wishlist || []);
  const dispatch = useDispatch();

  if (!wishlist.length) {
    return (
      <>
        <Navbar />
        <div className="container my-3 py-5">
          <h1 className="text-center">Wishlist</h1>
          <hr />
          <div className="col-md-12 py-5 bg-light text-center">
            <h4 className="p-3 display-6">Your wishlist is empty</h4>
            <Link to="/products" className="btn btn-outline-dark">
              <i className="fa fa-arrow-left" /> Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="m-0">Wishlist</h1>
          <button
            className="btn btn-outline-danger"
            onClick={() => dispatch(clearWishlist())}
          >
            <i className="fa fa-trash" /> Clear All
          </button>
        </div>
        <hr />
        <div className="row">
          {wishlist.map((item) => (
            <div key={item.id} className="col-md-4 col-sm-6 col-12 mb-4">
              <div className="card h-100 text-center">
                <div
                  className="p-3"
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    className="img-fluid"
                    src={item.image}
                    alt={item.title}
                    style={{ maxHeight: "100%" }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="lead mb-2">{formatPrice(item.price)}</p>
                  <div className="mt-auto d-flex justify-content-center gap-2">
                    <Link
                      to={`/product/${item.id}`}
                      className="btn btn-outline-dark btn-sm"
                    >
                      Details
                    </Link>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() => {
                        dispatch(addCart(item));
                        toast.success("Added to cart");
                      }}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => dispatch(toggleWishlist(item))}
                    >
                      <i className="fa fa-heart" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
