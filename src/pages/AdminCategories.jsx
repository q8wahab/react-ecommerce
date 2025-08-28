import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

/** slugify بسيط */
function slugify(str = '') {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, '')         // تخلّص سريع من العربية للسلَغ (اختياري)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** مودال بسيط بدون Bootstrap JS */
function CategoryModal({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const isEdit = !!initial?._id || !!initial?.id;

  useEffect(() => {
    setName(initial?.name || '');
    setSlug(initial?.slug || '');
  }, [initial]);

  useEffect(() => {
    // إذا المستخدم ما لمس slug يدويًا، نولّده من الاسم
    if (!initial?.slug && name && !slug) {
      setSlug(slugify(name));
    }
  }, [name, initial, slug]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      await onSubmit({ name: name.trim(), slug: slug.trim() || slugify(name) });
    } catch (e) {
      // onSubmit سيعرض toast
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
      {/* Modal */}
      <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Category' : 'Add Category'}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Capsule Drawers"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="capsule-drawers"
                  />
                  <small className="text-muted">If empty, it will be generated automatically.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const Categories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getCategories();
      const list = Array.isArray(res) ? res : (res?.items || []);
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (cat) => {
    setEditing(cat);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const onSubmit = async (payload) => {
    try {
      if (editing?._id || editing?.id) {
        await ApiService.updateCategory(editing._id || editing.id, payload);
        toast.success('Category updated');
      } else {
        await ApiService.createCategory(payload);
        toast.success('Category created');
      }
      closeModal();
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Operation failed');
      throw e;
    }
  };

  const onDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await ApiService.deleteCategory(cat._id || cat.id);
      toast.success('Category deleted');
      setItems((prev) => prev.filter((c) => (c._id || c.id) !== (cat._id || cat.id)));
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 mb-0">Categories</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fa fa-plus me-2"></i>
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="row g-2 mb-3">
        <div className="col-sm-6 col-md-4">
          <div className="input-group">
            <span className="input-group-text"><i className="fa fa-search" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          ) : filtered.length ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cat, idx) => (
                    <tr key={cat._id || cat.id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>{cat.name}</td>
                      <td><code>{cat.slug}</code></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEdit(cat)}
                          >
                            <i className="fa fa-pen me-1"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(cat)}
                          >
                            <i className="fa fa-trash me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No categories found.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <CategoryModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        initial={editing}
      />
    </AdminLayout>
  );
};

export default Categories;
