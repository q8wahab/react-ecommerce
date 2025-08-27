import React, { useEffect, useRef, useState } from 'react';
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

  // ▼ إضافة بسيطة لتشغيل القائمة بدون Bootstrap JS
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleMenu = () => setMenuOpen(v => !v);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);
  // ▲

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/login', { replace: true });
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
            aria-controls="adminNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
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
              <li className="nav-item dropdown" ref={dropdownRef}>
                {/* زر القائمة */}
                <button
                  id="adminMenu"
                  type="button"
                  className="nav-link dropdown-toggle btn btn-link p-0"
                  // data-bs-toggle="dropdown"  ← مو مطلوب بعد ما سوّينا التحكم يدوي
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : 'false'}
                  title="Admin menu"
                  onClick={toggleMenu}
                >
                  <i className="fa fa-user me-1"></i>
                  {user?.name || 'admin user'}
                </button>

                {/* القائمة — نضيف show حسب الحالة */}
                <ul
                  className={`dropdown-menu dropdown-menu-end${menuOpen ? ' show' : ''}`}
                  aria-labelledby="adminMenu"
                  style={{ position: 'absolute' }}
                >
                  <li>
                    <Link className="dropdown-item" to="/" target="_blank" rel="noreferrer">
                      <i className="fa fa-home me-1"></i>
                      View Store
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
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
