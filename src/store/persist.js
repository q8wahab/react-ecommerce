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

const WISHLIST_KEY = "wishlist";

export function loadWishlistState() {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWishlistState(arr) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(arr ?? []));
  } catch {}
}

const AUTH_KEY = "auth";

export function loadAuthState() {
  try {
    if (typeof window === "undefined") return { user: null, isAuthenticated: false, isLoading: false, error: null };
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { user: null, isAuthenticated: false, isLoading: false, error: null };
    const parsed = JSON.parse(raw);
    return parsed || { user: null, isAuthenticated: false, isLoading: false, error: null };
  } catch {
    return { user: null, isAuthenticated: false, isLoading: false, error: null };
  }
}

export function saveAuthState(authState) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(authState ?? { user: null, isAuthenticated: false, isLoading: false, error: null }));
  } catch {}
}
