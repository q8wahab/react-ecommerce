// src/pages/AdminOrders.jsx
import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ApiService from '../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';

const STATUS_OPTIONS = [
  'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
];

const PAYMENT_OPTIONS = ['cash', 'knet'];

// Modal بسيط بدون Bootstrap JS
function OrderModal({ open, onClose, order, onOpenInvoice }) {
  if (!open || !order) return null;

  const items = order.items || order.lineItems || [];
  const shipping = order.shippingAddress || {};
  const customer = order.customer || {};

  const totalKwd =
    (order.totalInFils != null ? order.totalInFils / 1000 : order.total) ?? 0;

  // تهيئة عنوان الشحن وفق سكيمتك: area/block/street/avenue/houseNo/notes
  const shippingLines = (() => {
    // fallback عام لو جاي بأسلوب line1..country
    const generic =
      [shipping.line1, shipping.line2, shipping.city, shipping.state, shipping.postalCode, shipping.country]
        .filter(Boolean)
        .join(', ');

    const customParts = [
      shipping.area ? `Area: ${shipping.area}` : null,
      shipping.block ? `Block: ${shipping.block}` : null,
      shipping.street ? `Street: ${shipping.street}` : null,
      shipping.avenue ? `Avenue: ${shipping.avenue}` : null,
      shipping.houseNo ? `House: ${shipping.houseNo}` : null,
      shipping.notes ? `Notes: ${shipping.notes}` : null,
    ].filter(Boolean);

    const lines = customParts.length ? customParts : (generic ? [generic] : []);
    return lines.length ? lines : ['-'];
  })();

  const phone = customer.phone || order.customerPhone || '-';
  const email = customer.email || order.customerEmail || '-';

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Order Details — #{String(order._id || order.id).slice(-6)}
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Customer</h6>
                  <div>{customer.name || order.customerName || '-'}</div>
                  <div className="text-muted small">Email: {email}</div>
                  <div className="text-muted small">Phone: {phone}</div>
                </div>

                <div className="col-md-6">
                  <h6 className="text-muted mb-1">Order</h6>
                  <div>
                    Status{' '}
                    <span className="badge bg-secondary ms-1">
                      {order.status || order.paymentStatus || 'pending'}
                    </span>
                  </div>
                  <div>
                    Payment{' '}
                    <span className="badge bg-light text-dark ms-1">
                      {order.paymentMethod || '-'}
                    </span>
                  </div>
                  <div>Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</div>
                  <div className="fw-semibold mt-1">Total: {formatPrice(totalKwd)}</div>
                </div>
              </div>

              <hr />

              <h6 className="mb-2">Items ({items.length})</h6>
              {items.length ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ width: 100 }}>Qty</th>
                        <th style={{ width: 160 }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => {
                        const title = it.title || it.productTitle || it.product?.title || `Item ${idx + 1}`;
                        const qty = it.qty ?? it.quantity ?? 1;
                        const price = (it.priceInFils != null ? it.priceInFils / 1000 : it.price) ?? 0;
                        return (
                          <tr key={it._id || it.id || idx}>
                            <td>{title}</td>
                            <td>{qty}</td>
                            <td>{formatPrice(price)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No items.</p>
              )}

              <hr />

              <div className="row g-3">
                <div className="col-md-12">
                  <h6 className="text-muted mb-1">Shipping Address</h6>
                  <div className="small">
                    {shipping.name ? <div className="mb-1">{shipping.name}</div> : null}
                    {shippingLines.map((ln, i) => (
                      <div key={i}>{ln}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {onOpenInvoice ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenInvoice(order)}
                >
                  Invoice PDF
                </button>
              ) : null}
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const Orders = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = useMemo(
    () => (total && limit ? Math.max(1, Math.ceil(total / limit)) : 1),
    [total, limit]
  );

  const load = async (opts = {}) => {
    try {
      setLoading(true);
      const params = {
        page: opts.page ?? page,
        limit,
        status: (opts.status ?? status) || undefined,
        q: (opts.q ?? q) || undefined,
        sort: '-createdAt',
      };

      const res = await ApiService.getOrders(params);
      const list = Array.isArray(res) ? res : (res.items || res.data || []);
      setItems(list);
      setTotal(
        res?.total ?? res?.count ?? (Array.isArray(res) ? res.length : list.length)
      );
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = async (e) => {
    e?.preventDefault?.();
    await load({ page: 1, q, status });
    setPage(1);
  };

  const clearFilters = async () => {
    setQ('');
    setStatus('');
    await load({ page: 1, q: '', status: '' });
    setPage(1);
  };

  const openDetails = (order) => {
    setSelected(order);
    setModalOpen(true);
  };
  const closeDetails = () => setModalOpen(false);

  const changeStatus = async (order, nextStatus) => {
    try {
      if (!nextStatus || nextStatus === (order.status || order.paymentStatus)) return;
      await ApiService.updateOrder(order._id || order.id, { status: nextStatus });
      toast.success('Order status updated');

      setItems((prev) =>
        prev.map((o) =>
          (o._id || o.id) === (order._id || order.id) ? { ...o, status: nextStatus } : o
        )
      );

      // لو نافذة التفاصيل مفتوحة، حدث العرض
      setSelected((prev) =>
        prev && (prev._id || prev.id) === (order._id || order.id)
          ? { ...prev, status: nextStatus }
          : prev
      );
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to update status');
    }
  };

  const changePaymentMethod = async (order, method) => {
    try {
      if (!method || !PAYMENT_OPTIONS.includes(method)) return;
      if ((order.paymentMethod || '').toLowerCase() === method.toLowerCase()) return;

      await ApiService.updateOrder(order._id || order.id, { paymentMethod: method });
      toast.success('Payment method updated');

      setItems((prev) =>
        prev.map((o) =>
          (o._id || o.id) === (order._id || order.id) ? { ...o, paymentMethod: method } : o
        )
      );

      // لو نافذة التفاصيل مفتوحة، حدث العرض
      setSelected((prev) =>
        prev && (prev._id || prev.id) === (order._id || order.id)
          ? { ...prev, paymentMethod: method }
          : prev
      );
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to update payment method');
    }
  };

  const openInvoicePdf = async (order) => {
    try {
      const blob = await ApiService.getOrderInvoicePdfBlob(order._id || order.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      // تنظيف بعد دقيقة
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to open invoice');
    }
  };

  const exportCSV = async () => {
    try {
      await ApiService.exportOrdersCSV({ status: status || undefined, q: q || undefined });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Export failed');
    }
  };

  const gotoPage = async (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    await load({ page: p });
  };

  return (
    <AdminLayout>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">Orders</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={clearFilters}>
            Clear
          </button>
          <button className="btn btn-outline-primary" onClick={exportCSV}>
            <i className="fa fa-file-export me-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <form className="row g-2 mb-3" onSubmit={onFilter}>
        <div className="col-sm-6 col-md-4">
          <div className="input-group">
            <span className="input-group-text"><i className="fa fa-search" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search order id, customer name/email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="col-sm-4 col-md-3">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-2 col-md-2">
          <button className="btn btn-primary w-100" type="submit">Apply</button>
        </div>
      </form>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : items.length ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th style={{ width: 240 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => {
                    const id = o._id || o.id;
                    const shortId = String(id).slice(-6);
                    const when = o.createdAt ? new Date(o.createdAt).toLocaleString() : '-';
                    const customerName = o.customer?.name || o.customerName || '-';
                    const email = o.customer?.email || o.customerEmail || '';
                    const total =
                      (o.totalInFils != null ? o.totalInFils / 1000 : o.total) ?? 0;
                    const statusVal = o.status || o.paymentStatus || 'pending';
                    const paymentVal = (o.paymentMethod || '').toLowerCase();

                    return (
                      <tr key={id}>
                        <td><code>{shortId}</code></td>
                        <td>{when}</td>
                        <td>
                          <div>{customerName}</div>
                          {email ? <div className="text-muted small">{email}</div> : null}
                        </td>
                        <td>{formatPrice(total)}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={statusVal}
                            onChange={(e) => changeStatus(o, e.target.value)}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={PAYMENT_OPTIONS.includes(paymentVal) ? paymentVal : ''}
                            onChange={(e) => changePaymentMethod(o, e.target.value)}
                          >
                            <option value="">—</option>
                            {PAYMENT_OPTIONS.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openDetails(o)}
                            >
                              Details
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openInvoicePdf(o)}
                              title="Invoice PDF"
                            >
                              Invoice PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No orders found.</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center pt-3">
              <div className="text-muted small">
                Page {page} of {totalPages} — {total} orders
              </div>
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => gotoPage(page - 1)} disabled={page <= 1}>
                  Prev
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => gotoPage(page + 1)} disabled={page >= totalPages}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderModal
        open={modalOpen}
        onClose={closeDetails}
        order={selected}
        onOpenInvoice={openInvoicePdf}
      />
    </AdminLayout>
  );
};

export default Orders;
