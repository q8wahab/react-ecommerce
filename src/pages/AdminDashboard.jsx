import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ApiService from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await ApiService.getProducts({ limit: 5 });
        const products = productsResponse.items || productsResponse;
        
        // Fetch categories
        const categories = await ApiService.getCategories();
        
        setStats({
          totalProducts: productsResponse.total || products.length,
          totalCategories: categories.length,
          totalOrders: 0, // TODO: Implement orders endpoint
          recentProducts: products.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
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
          <h1 className="h3 mb-4">Dashboard</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Products
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalProducts}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fa fa-box fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Categories
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalCategories}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fa fa-tags fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalOrders}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fa fa-shopping-cart fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    KWD 0
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fa fa-dollar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Link to="/admin/products/new" className="btn btn-primary btn-block">
                    <i className="fa fa-plus me-2"></i>
                    Add New Product
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/categories/new" className="btn btn-success btn-block">
                    <i className="fa fa-plus me-2"></i>
                    Add Category
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/products" className="btn btn-info btn-block">
                    <i className="fa fa-list me-2"></i>
                    Manage Products
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/orders" className="btn btn-warning btn-block">
                    <i className="fa fa-shopping-cart me-2"></i>
                    View Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">Recent Products</h6>
              <Link to="/admin/products" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {stats.recentProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentProducts.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <img 
                              src={product.image || product.images?.[0]?.url || '/placeholder-image.jpg'} 
                              alt={product.title}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              className="rounded"
                            />
                          </td>
                          <td>{product.title}</td>
                          <td>{product.category?.name || 'N/A'}</td>
                          <td>KWD {(product.priceInFils / 1000).toFixed(3)}</td>
                          <td>{product.stock || 0}</td>
                          <td>
                            <Link 
                              to={`/admin/products/${product._id}/edit`} 
                              className="btn btn-sm btn-outline-primary me-1"
                            >
                              Edit
                            </Link>
                            <Link 
                              to={`/product/${product._id}`} 
                              className="btn btn-sm btn-outline-info"
                              target="_blank"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No products found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

