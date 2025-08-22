import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { addCart, delCart, clearCart } from "../redux/action";
import { formatPrice } from "../utils/format";
import { useTranslation } from "react-i18next";

const MiniCartOffcanvas = () => {
  const { t } = useTranslation();
  const cart = useSelector((s) => s.handleCart || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  const totalItems = cart.reduce((sum, it) => sum + it.qty, 0);

  const closeOffcanvasAndNavigate = (path) => {
    const el = document.getElementById("miniCart");
    if (!el) {
      navigate(path);
      return;
    }

    const instance = Offcanvas.getInstance(el) || new Offcanvas(el);

    const onHidden = () => {
      el.removeEventListener("hidden.bs.offcanvas", onHidden);
      document.querySelectorAll(".offcanvas-backdrop").forEach((b) => b.remove());
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
      el.classList.remove("show");
      navigate(path);
    };

    el.addEventListener("hidden.bs.offcanvas", onHidden, { once: true });
    instance.hide();
  };

  const removeAllOf = (item) => {
    for (let i = 0; i < (item.qty || 1); i++) dispatch(delCart(item));
  };

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="miniCart"
      aria-labelledby="miniCartLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="miniCartLabel">
          {t("cart.title")} ({totalItems})
        </h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label={t("ui.close", "Close")}
        />
      </div>

      <div className="offcanvas-body d-flex flex-column">
        {cart.length === 0 ? (
          <div className="text-center my-5">
            <p className="lead mb-3">{t("cart.empty")}</p>
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() => closeOffcanvasAndNavigate("/products")}
            >
              <i className="fa fa-arrow-left" /> {t("checkout.back_to_products")}
            </button>
          </div>
        ) : (
          <>
            <ul className="list-group list-group-flush mb-3" style={{ overflowY: "auto" }}>
              {cart.map((item) => (
                <li key={item.id} className="list-group-item">
                  <div className="d-flex">
                    <div
                      className="flex-shrink-0 d-flex align-items-center justify-content-center"
                      style={{ width: 64, height: 64 }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                      />
                    </div>

                    <div className="flex-grow-1 ms-3">
                      <div className="d-flex justify-content-between">
                        <strong className="me-2" style={{ maxWidth: "70%" }}>
                          {item.title}
                        </strong>
                        <span className="text-nowrap">{formatPrice(item.price)}</span>
                      </div>

                      <div className="d-flex align-items-center mt-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => dispatch(delCart(item))}
                          title={t("cart.decrease", "Decrease")}
                          type="button"
                        >
                          <i className="fa fa-minus" />
                        </button>
                        <span className="mx-3">{item.qty}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => dispatch(addCart(item))}
                          title={t("cart.increase", "Increase")}
                          type="button"
                        >
                          <i className="fa fa-plus" />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger ms-3"
                          onClick={() => removeAllOf(item)}
                          title={t("cart.remove", "Remove item")}
                          type="button"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>

                      <small className="text-muted">
                        {t("cart.line_total", "Line")}: {formatPrice(item.price * item.qty)}
                      </small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <div className="d-flex justify-content-between mb-2">
                <strong>{t("cart.subtotal")}</strong>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-dark w-50"
                  onClick={() => closeOffcanvasAndNavigate("/cart")}
                >
                  {t("cart.view_cart", "View Cart")}
                </button>
                <button
                  type="button"
                  className="btn btn-dark w-50"
                  onClick={() => closeOffcanvasAndNavigate("/checkout")}
                >
                  {t("cart.checkout")}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger w-100 mt-2"
                onClick={() => dispatch(clearCart())}
              >
                <i className="fa fa-trash" /> {t("cart.clear_cart", "Clear Cart")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniCartOffcanvas;
