import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const toggle = () => {
    const next = isAr ? "en" : "ar";
    i18n.changeLanguage(next);
    // ❌ لا نغيّر اتجاه الصفحة
    document.documentElement.lang = next;
    localStorage.setItem("lang", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`btn btn-outline-secondary d-inline-flex align-items-center gap-1 ${className}`}
      title={isAr ? "Switch to English" : "التبديل للعربية"}
    >
      <span style={{ opacity: isAr ? 1 : 0.4, fontWeight: isAr ? "bold" : "normal" }}>ع</span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span style={{ opacity: isAr ? 0.4 : 1, fontWeight: isAr ? "normal" : "bold" }}>E</span>
    </button>
  );
};

export default LanguageSwitcher;
