import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const current = i18n.language === "ar" ? "ar" : "en";

  const toggle = () => {
    const next = current === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    // حدّث اتجاه الصفحة ولغة الـ HTML
    document.documentElement.dir = i18n.dir(next);
    document.documentElement.lang = next;
    localStorage.setItem("lang", next);
  };

  return (
    <button type="button" onClick={toggle} className={`btn btn-outline-secondary ${className}`}>
      {current === "ar" ? "EN" : "عربي"}
    </button>
  );
};

export default LanguageSwitcher;
