// src/store/persist.js
const KEY = "cart";

export function loadCartState() {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("loadCartState error:", e);
    return [];
  }
}

export function saveCartState(cartArray) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(cartArray ?? []));
  } catch (e) {
    console.warn("saveCartState error:", e);
  }
}
