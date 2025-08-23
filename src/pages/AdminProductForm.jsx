// src/pages/AdminProductForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ImageUpload from '../components/ImageUpload';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

const toIntOrNull = (v) => {
  if (v === '' || v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const normalizeForCompare = (obj) => ({
  ...obj,
  priceInFils: obj.priceInFils ?? null,
  oldPriceInFils: obj.oldPriceInFils ?? null,
  stock: obj.stock ?? 0,
  category: obj.category ?? '',
  description: obj.description ?? '',
  status: obj.status ?? 'active',
  title: obj.title ?? '',
  slug: obj.slug ?? '',
});

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    priceInFils: '',
    oldPriceInFils: '',
    stock: '',
    category: '',
    images: [],
    status: 'active',
  });

  const initialRef = useRef(null); // نحتفظ بنسخة الأصل للمقارنة (diff)
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // تحميل التصنيفات + المنتج (عند التعديل)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const categoriesData = await ApiService.getCategories();
        if (!cancelled) setCategories(categoriesData);
      } catch {
        if (!cancelled) toast.error('Failed to load categories');
      }

      if (isEdit && id) {
        try {
          if (!cancelled) setLoading(true);
          const product = await ApiService.getProduct(id);

          const init = {
            title: product.title || '',
            slug: product.slug || '',
            description: product.description || '',
            priceInFils: product.priceInFils ?? null,
            oldPriceInFils: product.oldPriceInFils ?? null,
            stock: product.stock ?? 0,
            category: product.category?._id || '',
            images: product.images || [],
            status: product.status || 'active',
          };
          initialRef.current = normalizeForCompare(init);

          if (!cancelled) {
            setFormData({
              ...init,
              // نحول null إلى '' لعرضه في الحقل
              priceInFils: init.priceInFils ?? '',
              oldPriceInFils: init.oldPriceInFils ?? '',
              stock: String(init.stock ?? ''),
            });
          }
        } catch (error) {
          toast.error('Failed to load product');
          if (!cancelled) navigate('/admin/products');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id, isEdit, navigate]);

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleImageUploaded = (imageData) => {
    const newImage = {
      url: imageData.url,
      publicId: imageData.publicId,
      isPrimary: imageData.isPrimary || formData.images.length === 0,
    };
    setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }));
  };

  const handleImageRemoved = (index, setPrimary = false) => {
    if (setPrimary) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const buildDiffPayload = () => {
    if (!isEdit || !initialRef.current) {
      // إنشاء جديد: نعيد بيانات كاملة بعد تحويل الأرقام
      return {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description,
        priceInFils: toIntOrNull(formData.priceInFils),
        oldPriceInFils: toIntOrNull(formData.oldPriceInFils),
        stock: toIntOrNull(formData.stock) ?? 0,
        category: formData.category || undefined,
        images: formData.images,
        status: formData.status,
      };
    }

    const currentNorm = normalizeForCompare({
      ...formData,
      priceInFils: toIntOrNull(formData.priceInFils),
      oldPriceInFils: toIntOrNull(formData.oldPriceInFils),
      stock: toIntOrNull(formData.stock),
    });

    const initial = initialRef.current;
    const payload = {};

    // نقارن حقلاً حقلاً
    const fields = [
      'title',
      'slug',
      'description',
      'priceInFils',
      'oldPriceInFils',
      'stock',
      'category',
      'status',
    ];
    fields.forEach((f) => {
      if (currentNorm[f] !== initial[f]) {
        payload[f] = currentNorm[f];
      }
    });

    // الصور: نقارن ببساطة بالطول/المحتوى (مقارنة عميقة بسيطة)
    const imagesChanged =
      JSON.stringify(formData.images) !== JSON.stringify(initial.images || []);
    if (imagesChanged) payload.images = formData.images;

    // مسح السعر القديم: نرسل null صراحة
    if (
      initial.oldPriceInFils !== null &&
      (formData.oldPriceInFils === '' || currentNorm.oldPriceInFils === null)
    ) {
      payload.oldPriceInFils = null;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تحقق أساسي
    if (!String(formData.title).trim()) {
      toast.error('Product title is required');
      return;
    }

    try {
      setLoading(true);

      if (!isEdit) {
        // CREATE: price مطلوب
        const priceInt = toIntOrNull(formData.priceInFils);
        if (!Number.isInteger(priceInt) || priceInt <= 0) {
          toast.error('Valid price (in fils) is required');
          setLoading(false);
          return;
        }
        const oldInt = toIntOrNull(formData.oldPriceInFils);
        if (oldInt !== null) {
          if (oldInt < 0) {
            toast.error('Old price must be a non-negative integer (in fils)');
            setLoading(false);
            return;
          }
          if (oldInt <= priceInt) {
            toast.error('Old price must be greater than current price');
            setLoading(false);
            return;
          }
        }

        const payload = buildDiffPayload();
        await ApiService.request('/products', { method: 'POST', body: payload });
        toast.success('Product created successfully');
        navigate('/admin/products');
        return;
      }

      // EDIT: نبني diff فقط
      const payload = buildDiffPayload();

      // لا شيء تغيّر؟
      if (Object.keys(payload).length === 0) {
        toast('No changes to save');
        setLoading(false);
        return;
      }

      // فاليديشن ذكي في وضع Edit
      const newPrice =
        payload.priceInFils != null ? payload.priceInFils : initialRef.current.priceInFils;
      const newOld = payload.hasOwnProperty('oldPriceInFils')
        ? payload.oldPriceInFils // قد يكون null لمسح الخصم
        : initialRef.current.oldPriceInFils;

      if (payload.priceInFils != null) {
        if (!Number.isInteger(payload.priceInFils) || payload.priceInFils <= 0) {
          toast.error('Valid price (in fils) is required');
          setLoading(false);
          return;
        }
      }

      if (payload.hasOwnProperty('oldPriceInFils')) {
        if (payload.oldPriceInFils !== null) {
          if (!Number.isInteger(payload.oldPriceInFils) || payload.oldPriceInFils < 0) {
            toast.error('Old price must be a non-negative integer (in fils)');
            setLoading(false);
            return;
          }
        }
      }

      // علاقة old > price إذا كان هناك Old موجود (جديد أو قديم)
      if (newOld !== null && newOld !== undefined) {
        if (!(newOld > newPrice)) {
          toast.error('Old price must be greater than current price');
          setLoading(false);
          return;
        }
      }

      await ApiService.request(`/products/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // معاينات KWD
  const priceKwdPreview =
    formData.priceInFils !== '' && !Number.isNaN(Number(formData.priceInFils))
      ? `KWD ${(Number(formData.priceInFils) / 1000).toFixed(3)}`
      : '';

  const oldPriceKwdPreview =
    formData.oldPriceInFils !== '' && !Number.isNaN(Number(formData.oldPriceInFils))
      ? `KWD ${(Number(formData.oldPriceInFils) / 1000).toFixed(3)}`
      : '';

  const showDiscountPreview =
    priceKwdPreview &&
    oldPriceKwdPreview &&
    Number(formData.oldPriceInFils) > Number(formData.priceInFils);

  const discountPercent = showDiscountPreview
    ? Math.round(
        (1 - Number(formData.priceInFils) / Number(formData.oldPriceInFils)) * 100
      )
    : 0;

  return (
    <AdminLayout>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="title" className="form-label">Product Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="slug" className="form-label">Slug *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="priceInFils" className="form-label">Price (in Fils) *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="priceInFils"
                      name="priceInFils"
                      value={formData.priceInFils}
                      onChange={handleInputChange}
                      min="0"
                      required={!isEdit} // في التعديل ليس مطلوبًا
                    />
                    <div className="form-text">{priceKwdPreview}</div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="oldPriceInFils" className="form-label">
                      Old Price (in Fils) <span className="text-muted">(optional)</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        id="oldPriceInFils"
                        name="oldPriceInFils"
                        value={formData.oldPriceInFils}
                        onChange={handleInputChange}
                        min="0"
                      />
                      {formData.oldPriceInFils !== '' && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Clear old price"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, oldPriceInFils: '' }))
                          }
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="form-text">{oldPriceKwdPreview}</div>
                    {showDiscountPreview && (
                      <div className="small mt-1">
                        Discount: <strong>{discountPercent}%</strong>
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="stock" className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      {/* Model values: draft | active | archived */}
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEdit ? 'Update Product' : 'Create Product'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/admin/products')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">Product Images</h6>
            </div>
            <div className="card-body">
              <ImageUpload
                existingImages={formData.images}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
