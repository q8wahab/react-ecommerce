import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/slice';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/login');
    }
  };

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-danger">Access Denied</h3>
                <p>You need admin privileges to access this page.</p>
                <Link to="/login" className="btn btn-primary">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Admin Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/admin">
            <i className="fa fa-cogs me-2"></i>
            Admin Dashboard
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="adminNavbar">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  to="/admin"
                >
                  <i className="fa fa-dashboard me-1"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/admin/products') ? 'active' : ''}`}
                  to="/admin/products"
                >
                  <i className="fa fa-box me-1"></i>
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/admin/categories') ? 'active' : ''}`}
                  to="/admin/categories"
                >
                  <i className="fa fa-tags me-1"></i>
                  Categories
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
                  to="/admin/orders"
                >
                  <i className="fa fa-shopping-cart me-1"></i>
                  Orders
                </Link>
              </li>
            </ul>

            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                {/* Replaced <a href="#"> with a button for a11y */}
                <button
                  id="adminMenu"
                  type="button"
                  className="nav-link dropdown-toggle btn btn-link p-0"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa fa-user me-1"></i>
                  {user?.name}
                </button>
                <ul className="dropdown-menu" aria-labelledby="adminMenu">
                  <li>
                    <Link className="dropdown-item" to="/">
                      <i className="fa fa-home me-1"></i>
                      View Store
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="fa fa-sign-out me-1"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
