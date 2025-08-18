import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ImageUpload from '../components/ImageUpload';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    priceInFils: '',
    stock: '',
    category: '',
    images: [],
    status: 'active'
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await ApiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await ApiService.getProduct(id);
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        description: product.description || '',
        priceInFils: product.priceInFils || '',
        stock: product.stock || '',
        category: product.category?._id || '',
        images: product.images || [],
        status: product.status || 'active'
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleImageUploaded = (imageData) => {
    const newImage = {
      url: imageData.url,
      publicId: imageData.publicId,
      isPrimary: imageData.isPrimary || formData.images.length === 0
    };

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const handleImageRemoved = (index, setPrimary = false) => {
    if (setPrimary) {
      // Set as primary image
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index
        }))
      }));
    } else {
      // Remove image
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Product title is required');
      return;
    }

    if (!formData.priceInFils || formData.priceInFils <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        priceInFils: parseInt(formData.priceInFils),
        stock: parseInt(formData.stock) || 0
      };

      if (isEdit) {
        await ApiService.request(`/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(productData)
        });
        toast.success('Product updated successfully');
      } else {
        await ApiService.request('/products', {
          method: 'POST',
          body: JSON.stringify(productData)
        });
        toast.success('Product created successfully');
      }

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
                      required
                    />
                    <div className="form-text">
                      {formData.priceInFils && `KWD ${(formData.priceInFils / 1000).toFixed(3)}`}
                    </div>
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
                  <div className="col-md-4 mb-3">
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
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
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

