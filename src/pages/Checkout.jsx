import React, { useEffect, useMemo, useState } from "react";
import { Footer, Navbar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/format";
import ApiService from "../services/api";
import toast from "react-hot-toast";
import { clearCart } from "../redux/action";
import { useTranslation } from "react-i18next";

const FREE_SHIP_THRESHOLD = 15; // KWD
const BASE_SHIPPING = 2;        // KWD

const Checkout = () => {
  const { t } = useTranslation();

  const cart = useSelector((state) => state.handleCart || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // فلاغ يمنع الرجوع للمنتجات أثناء التحويل لصفحة النجاح
  const [redirecting, setRedirecting] = useState(false);
  const shouldRedirectToProducts = !redirecting && (!cart || cart.length === 0);

  // الحقول المطلوبة
  const [form, setForm] = useState(() => ({
    name:     localStorage.getItem("ck_name")     || "",
    area:     localStorage.getItem("ck_area")     || "",
    block:    localStorage.getItem("ck_block")    || "",
    street:   localStorage.getItem("ck_street")   || "",
    avenue:   localStorage.getItem("ck_avenue")   || "",
    houseNo:  localStorage.getItem("ck_houseNo")  || "",
    phone:    localStorage.getItem("ck_phone")    || "",
    email:    localStorage.getItem("ck_email")    || "",
    notes:    localStorage.getItem("ck_notes")    || "",
  }));
  const [submitting, setSubmitting] = useState(false);

  // حفظ تلقائي
  useEffect(() => {
    localStorage.setItem("ck_name",    form.name);
    localStorage.setItem("ck_area",    form.area);
    localStorage.setItem("ck_block",   form.block);
    localStorage.setItem("ck_street",  form.street);
    localStorage.setItem("ck_avenue",  form.avenue);
    localStorage.setItem("ck_houseNo", form.houseNo);
    localStorage.setItem("ck_phone",   form.phone);
    localStorage.setItem("ck_email",   form.email);
    localStorage.setItem("ck_notes",   form.notes);
  }, [form]);

  // ملخص الطلب
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0),
    [cart]
  );
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + (item.qty || 1), 0),
    [cart]
  );
  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : BASE_SHIPPING;
  const total = subtotal + shipping;

  // الهاتف: 8 أرقام
  const phoneDigits = form.phone.replace(/\D/g, "");
  const phoneValid = /^\d{8}$/.test(phoneDigits);

  const isValid = useMemo(() => {
    return (
      form.name.trim() &&
      form.area.trim() &&
      form.block.trim() &&
      form.street.trim() &&
      form.houseNo.trim() &&
      phoneValid &&
      cart.length > 0
    );
  }, [form, phoneValid, cart.length]);

  const handleChange = (field) => (e) => {
    let val = e.target.value;
    if (field === "phone") {
      val = val.replace(/\D/g, "").slice(0, 8); // أرقام فقط وبحد أقصى 8
    }
    setForm((f) => ({ ...f, [field]: val }));
  };

  const clearCheckoutLocalStorage = () => {
    localStorage.removeItem("ck_name");
    localStorage.removeItem("ck_area");
    localStorage.removeItem("ck_block");
    localStorage.removeItem("ck_street");
    localStorage.removeItem("ck_avenue");
    localStorage.removeItem("ck_houseNo");
    localStorage.removeItem("ck_phone");
    localStorage.removeItem("ck_email");
    localStorage.removeItem("ck_notes");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    try {
      setSubmitting(true);

      const payload = {
        customer: {
          name: form.name.trim(),
          phone: phoneDigits,
          email: form.email.trim() || undefined,
        },
        shippingAddress: {
          area: form.area.trim(),
          block: form.block.trim(),
          street: form.street.trim(),
          avenue: form.avenue.trim() || undefined,
          houseNo: form.houseNo.trim(),
          notes: form.notes.trim() || undefined,
        },
        items: cart.map((c) => ({
          product: c.id || c._id,
          qty: c.qty || 1,
        })),
      };

      const res = await ApiService.createOrder(payload);
      toast.success(t("checkout.toast_created", { defaultValue: "تم إنشاء الطلب بنجاح" }));

      // امنع شرط الرجوع للمنتجات، ثم انتقل لصفحة النجاح
      setRedirecting(true);
      navigate(`/order-success/${res.id}`, {
        state: { invoiceNo: res.invoiceNo, totalInFils: res.totalInFils },
        replace: true,
      });

      // بعد الانتقال مباشرةً: فرّغ السلة ونظّف التخزين المحلي
      setTimeout(() => {
        dispatch(clearCart());
        clearCheckoutLocalStorage();
      }, 0);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || t("checkout.toast_failed", { defaultValue: "فشل إنشاء الطلب" }));
      setSubmitting(false);
    }
  };

  const remainingForFree = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">{t("checkout.title", { defaultValue: "إتمام الشراء" })}</h1>
        <hr />

        {shouldRedirectToProducts ? (
          <Navigate to="/products" replace />
        ) : (
          <div className="container py-4">
            <div className="row my-4">
              {/* ملخص الطلب */}
              <div className="col-md-5 col-lg-4 order-md-last">
                <div className="card mb-4">
                  <div className="card-header py-3 bg-light">
                    <h5 className="mb-0">{t("checkout.summary", { defaultValue: "ملخص الطلب" })}</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                        {t("checkout.items_label", { defaultValue: "المنتجات" })} ({totalItems})
                        <span>{formatPrice(subtotal)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                        {t("checkout.shipping", { defaultValue: "الشحن" })}
                        <span>
                          {shipping === 0 ? (
                            <span className="text-success">
                              {t("checkout.free", { defaultValue: "مجاني" })}
                            </span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                        <div>
                          <strong>{t("checkout.total", { defaultValue: "الإجمالي" })}</strong>
                          {subtotal < FREE_SHIP_THRESHOLD && (
                            <div className="small text-muted">
                              {t("checkout.free_shipping_remaining", {
                                defaultValue: "تبقّى {{amount}} للشحن المجاني",
                                amount: formatPrice(remainingForFree),
                              })}
                            </div>
                          )}
                        </div>
                        <span>
                          <strong>{formatPrice(total)}</strong>
                        </span>
                      </li>
                    </ul>

                    <ul className="list-group list-group-flush">
                      {cart.map((item) => (
                        <li
                          key={item.id || item._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span className="text-truncate" style={{ maxWidth: 220 }}>
                            {item.title} × {item.qty || 1}
                          </span>
                          <span>{formatPrice((item.price || 0) * (item.qty || 1))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* الحقول المطلوبة */}
              <div className="col-md-7 col-lg-8">
                <div className="card mb-4">
                  <div className="card-header py-3">
                    <h4 className="mb-0">{t("checkout.shipping_data", { defaultValue: "بيانات الشحن" })}</h4>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="row g-3">
                        <div className="col-12 my-1">
                          <label htmlFor="name" className="form-label">
                            {t("checkout.name", { defaultValue: "الاسم الكامل" })} *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={form.name}
                            onChange={handleChange("name")}
                            required
                          />
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="area" className="form-label">
                            {t("checkout.area", { defaultValue: "المنطقة" })} *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="area"
                            value={form.area}
                            onChange={handleChange("area")}
                            required
                          />
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="block" className="form-label">
                            {t("checkout.block", { defaultValue: "القطعة" })} *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="block"
                            value={form.block}
                            onChange={handleChange("block")}
                            required
                          />
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="street" className="form-label">
                            {t("checkout.street", { defaultValue: "الشارع" })} *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="street"
                            value={form.street}
                            onChange={handleChange("street")}
                            required
                          />
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="avenue" className="form-label">
                            {t("checkout.avenue_optional", { defaultValue: "جادة (اختياري)" })}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="avenue"
                            value={form.avenue}
                            onChange={handleChange("avenue")}
                          />
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="houseNo" className="form-label">
                            {t("checkout.house_no", { defaultValue: "رقم المنزل" })} *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="houseNo"
                            value={form.houseNo}
                            onChange={handleChange("houseNo")}
                            required
                          />
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="phone" className="form-label">
                            {t("checkout.phone_8", { defaultValue: "رقم الهاتف (8 أرقام)" })} *
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            className={`form-control ${form.phone && !phoneValid ? "is-invalid" : ""}`}
                            id="phone"
                            value={form.phone}
                            onChange={handleChange("phone")}
                            placeholder={t("checkout.phone_placeholder", { defaultValue: "مثال: 51234567" })}
                            required
                          />
                          {form.phone && !phoneValid && (
                            <div className="invalid-feedback">
                              {t("checkout.phone_invalid", { defaultValue: "الرجاء إدخال 8 أرقام فقط" })}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6 my-1">
                          <label htmlFor="email" className="form-label">
                            {t("checkout.email_optional", { defaultValue: "الإيميل (اختياري)" })}
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={form.email}
                            onChange={handleChange("email")}
                            placeholder="you@example.com"
                          />
                        </div>

                        <div className="col-12 my-1">
                          <label htmlFor="notes" className="form-label">
                            {t("checkout.notes_optional", { defaultValue: "تعليمات التوصيل (اختياري)" })}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="notes"
                            value={form.notes}
                            onChange={handleChange("notes")}
                            placeholder={t("checkout.notes_ph", {
                              defaultValue: "مثال: اتصل قبل الوصول / اتركها عند الباب..."
                            })}
                          />
                        </div>
                      </div>

                      <hr className="my-4" />

                      <button className="w-100 btn btn-dark" type="submit" disabled={!isValid || submitting}>
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            {t("checkout.sending", { defaultValue: "جاري الإرسال..." })}
                          </>
                        ) : (
                          t("checkout.submit_no_pay", { defaultValue: "إرسال الطلب (بدون دفع)" })
                        )}
                      </button>
                      <p className="text-muted small mt-2 mb-0">
                        {t("checkout.no_payment_note", {
                          defaultValue: "لن يتم طلب أي دفع الآن — سيتم التواصل لتأكيد التوصيل."
                        })}
                      </p>
                    </form>
                  </div>
                </div>

                {/* رجوع للمنتجات */}
                <div className="text-end">
                  <Link to="/products" className="btn btn-outline-secondary btn-sm">
                    {t("checkout.back_to_products", { defaultValue: "الرجوع للمنتجات" })}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
