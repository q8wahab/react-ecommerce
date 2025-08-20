// src/pages/OrderSuccess.jsx
import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { Navbar, Footer } from "../components";

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const invoiceNo = location.state?.invoiceNo;
  const totalInFils = location.state?.totalInFils;

  return (
    <>
      <Navbar />
      <div className="container my-5 py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card text-center shadow">
              <div className="card-body p-5">
                <div className="mb-3">
                  <i className="fa fa-check-circle text-success" style={{ fontSize: 64 }} />
                </div>
                <h3 className="mb-2">تم استلام طلبك</h3>
                <p className="text-muted mb-4">
                  رقم الطلب: <strong>{id}</strong>
                  {invoiceNo && (
                    <>
                      <br />
                      رقم الفاتورة: <strong>{invoiceNo}</strong>
                    </>
                  )}
                </p>
                {typeof totalInFils === "number" && (
                  <p className="lead">
                    الإجمالي: <strong>KWD {(totalInFils / 1000).toFixed(3)}</strong>
                  </p>
                )}
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
                  <Link to="/products" className="btn btn-outline-secondary">
                    متابعة التسوق
                  </Link>
                  <Link to="/" className="btn btn-dark">
                    الصفحة الرئيسية
                  </Link>
                </div>
                <p className="text-muted small mt-4 mb-0">
                  سنقوم بالتواصل معك لتأكيد التوصيل. شكرًا لتسوقك معنا!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccess;
