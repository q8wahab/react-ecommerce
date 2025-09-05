import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import MiniCartOffcanvas from "./MiniCartOffcanvas";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const SHOW_LOGIN_LINKS =
    String(process.env.REACT_APP_SHOW_LOGIN_LINKS || "")
      .trim()
      .toLowerCase() === "true";

  const cart = useSelector((state) => state.handleCart || []);
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

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

  const isAr = i18n.language?.startsWith("ar");
  const toggleLang = () => {
    const next = isAr ? "en" : "ar";
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
    localStorage.setItem("lang", next);
  };

  return (
    <>
      <nav className={navClass}>
        <div className="container">
          {/* left: brand */}
          <NavLink
            className="navbar-brand fw-bold fs-4 px-2 d-flex align-items-center"
            to="/"
          >
            {/* اللوقو + النص 24ozkw */}
            <img
              src={`${process.env.PUBLIC_URL}/assets/dark_logo.png`} // أو "/dark_logo.png" حسب مكان الملف
              alt="24ozkw logo"
              width={68}
              height={68}
              className="me-2"
              style={{
                objectFit: "contain",
                // عندنا نسخة وحدة غامقة، نخليها مقلوبة بالدارك مود عشان تصير فاتحة وتبين
                filter: dark ? "invert(1) hue-rotate(180deg)" : "none",
              }}
            />
            <span>24ozkw</span>
          </NavLink>

          {/* right: mobile cart (outside collapse) + burger */}
          <div className="d-flex align-items-center ms-auto">
            {/* Language toggle – mobile */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={isAr ? "Switch to English" : "التبديل للعربية"}
              title={isAr ? "Switch to English" : "التبديل للعربية"}
              className={`btn ${btnSkin} me-2 d-lg-none`}
            >
              {isAr ? "E" : "ع"}
            </button>

            {/* Cart — mobile only */}
            <button
              className={`btn ${btnSkin} me-2 d-lg-none`}
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#miniCart"
              aria-controls="miniCart"
            >
              <i className="fa fa-shopping-cart me-1" />
              <span className="d-none d-sm-inline">{t("nav.cart")}</span>
              <span className={`badge ${badgeSkin} ms-2`}>{totalItems}</span>
            </button>

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
                <NavLink className="nav-link" to="/">
                  {t("nav.home")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/products">
                  {t("nav.products")}
                </NavLink>
              </li>
              {/* <li className="nav-item">
                <NavLink className="nav-link" to="/about">{t("nav.about")}</NavLink>
              </li> */}
              {/* <li className="nav-item">
                <NavLink className="nav-link" to="/contact">{t("nav.contact")}</NavLink>
              </li> */}
            </ul>

            {/* right inside collapse: language + auth + desktop cart + wishlist */}
            <div className="buttons text-center d-flex align-items-center gap-2">
              {/* Language toggle – desktop */}
              <button
                type="button"
                onClick={toggleLang}
                aria-label={isAr ? "Switch to English" : "التبديل للعربية"}
                title={isAr ? "Switch to English" : "التبديل للعربية"}
                className={`btn ${btnSkin} d-none d-lg-inline-flex`}
              >
                {isAr ? "E" : "ع"}
              </button>

              {SHOW_LOGIN_LINKS && (
                <>
                  <NavLink to="/login" className={`btn ${btnSkin}`}>
                    <i className="fa fa-sign-in me-1" /> {t("nav.login")}
                  </NavLink>
                  <NavLink to="/register" className={`btn ${btnSkin}`}>
                    <i className="fa fa-user-plus me-1" /> {t("nav.register")}
                  </NavLink>
                </>
              )}

              {/* Cart — desktop only */}
              <button
                className={`btn ${btnSkin} d-none d-lg-inline-flex`}
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#miniCart"
                aria-controls="miniCart"
              >
                <i className="fa fa-shopping-cart me-1" />
                {t("nav.cart")}{" "}
                <span className={`badge ${badgeSkin} ms-2`}>{totalItems}</span>
              </button>

              <NavLink to="/wishlist" className={`btn ${btnSkin}`}>
                <i className="fa fa-heart me-1" /> {t("nav.wishlist")}
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
