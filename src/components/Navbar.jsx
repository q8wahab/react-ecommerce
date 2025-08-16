import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import MiniCartOffcanvas from "./MiniCartOffcanvas";

const Navbar = () => {
  const cart = useSelector((state) => state.handleCart || []);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // read saved theme only (toggle button is commented out for now)
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("theme-dark", saved);
  }, []);

  const navClass = dark
    ? "navbar navbar-expand-lg navbar-dark bg-dark py-3 sticky-top"
    : "navbar navbar-expand-lg navbar-light bg-light py-3 sticky-top";

  const btnSkin = dark ? "btn-outline-light" : "btn-outline-dark";
  const badgeSkin = dark ? "bg-light text-dark" : "bg-dark text-white";

  return (
    <>
      <nav className={navClass}>
        <div className="container">
          {/* left: brand */}
          <NavLink className="navbar-brand fw-bold fs-4 px-2" to="/">
            24ozKw
          </NavLink>

          {/* right: mobile cart (outside collapse) + burger */}
          <div className="d-flex align-items-center ms-auto">
            {/* Cart — mobile only */}
            <button
              className={`btn ${btnSkin} me-2 d-lg-none`}
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#miniCart"
              aria-controls="miniCart"
            >
              <i className="fa fa-shopping-cart me-1" />
              <span className="d-none d-sm-inline">Cart</span>
              <span className={`badge ${badgeSkin} ms-2`}>{totalItems}</span>
            </button>

            {/* theme toggle (temporarily disabled) */}
            {/*
            <button onClick={toggleTheme} className={`btn ${btnSkin} me-2`}>
              {dark ? "Light" : "Dark"}
            </button>
            */}

            {/* burger */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          {/* collapse content */}
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* left links */}
            <ul className="navbar-nav me-auto my-2 text-center">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/products">Products</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">About</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">Contact</NavLink>
              </li>
            </ul>

            {/* right inside collapse: auth + desktop cart + wishlist */}
            <div className="buttons text-center d-flex align-items-center">
              <NavLink to="/login" className={`btn ${btnSkin} m-2`}>
                <i className="fa fa-sign-in me-1" /> Login
              </NavLink>
              <NavLink to="/register" className={`btn ${btnSkin} m-2`}>
                <i className="fa fa-user-plus me-1" /> Register
              </NavLink>

              {/* Cart — desktop only */}
              <button
                className={`btn ${btnSkin} m-2 d-none d-lg-inline-flex`}
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#miniCart"
                aria-controls="miniCart"
              >
                <i className="fa fa-shopping-cart me-1" />
                Cart <span className={`badge ${badgeSkin} ms-2`}>{totalItems}</span>
              </button>

              <NavLink to="/wishlist" className={`btn ${btnSkin} m-2`}>
                <i className="fa fa-heart me-1" /> Wishlist
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <MiniCartOffcanvas />
    </>
  );
};

export default Navbar;
