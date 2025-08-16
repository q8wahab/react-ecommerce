export const formatPrice = (value, currency = "KWD", locale = "en-KW") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(value ?? 0);
