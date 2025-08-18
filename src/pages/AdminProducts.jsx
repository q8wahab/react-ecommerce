import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      
      if (search) params.q = search;
      if (selectedCategory) params.category = selectedCategory;

      const response = await ApiService.getProducts(params);
      setProducts(response.items || response);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await ApiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await ApiService.request(`/products/${productId}`, { method: 'DELETE' });
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <AdminLayout>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">Products Management</h1>
            <Link to="/admin/products/new" className="btn btn-primary">
              <i className="fa fa-plus me-2"></i>
              Add New Product
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('');
                      setPage(1);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                Products ({total} total)
              </h6>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <img 
                                src={product.image || product.images?.[0]?.url || '/placeholder-image.jpg'} 
                                alt={product.title}
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                className="rounded"
                                onError={(e) => {
                                  e.target.src = '/placeholder-image.jpg';
                                }}
                              />
                            </td>
                            <td>
                              <div>
                                <strong>{product.title}</strong>
                                {product.description && (
                                  <div className="text-muted small">
                                    {product.description.length > 50 
                                      ? product.description.substring(0, 50) + '...'
                                      : product.description
                                    }
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{product.category?.name || 'N/A'}</td>
                            <td>KWD {(product.priceInFils / 1000).toFixed(3)}</td>
                            <td>
                              <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {product.stock || 0}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                {product.status || 'active'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <Link 
                                  to={`/product/${product._id}`} 
                                  className="btn btn-sm btn-outline-info"
                                  target="_blank"
                                  title="View Product"
                                >
                                  <i className="fa fa-eye"></i>
                                </Link>
                                <Link 
                                  to={`/admin/products/${product._id}/edit`} 
                                  className="btn btn-sm btn-outline-primary"
                                  title="Edit Product"
                                >
                                  <i className="fa fa-edit"></i>
                                </Link>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(product._id)}
                                  title="Delete Product"
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${pageNum === page ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}

                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No products found.</p>
                  <Link to="/admin/products/new" className="btn btn-primary">
                    Add Your First Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

