// src/services/api.js
const BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

function buildUrl(path, params) {
  const base = path.startsWith("http")
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const url = new URL(base, window.location.origin);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

// --- JWT helpers ---
function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

let refreshTimerId = null;
function scheduleRefresh(token) {
  clearTimeout(refreshTimerId);
  const payload = parseJwt(token);
  if (!payload?.exp) return;

  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = payload.exp - nowSec; // seconds till expiry
  const refreshAt = Math.max(5, Math.floor(ttl * 0.8)); // 80% من المدة

  refreshTimerId = setTimeout(() => {
    ApiService.refresh().catch(() => {
      // إذا فشل الريفريش نسوّي لوق أوت نظيف
      ApiService.logout().finally(() => (window.location.href = "/login"));
    });
  }, refreshAt * 1000);
}

async function httpRequest(
  path,
  { method = "GET", body, headers = {}, params, _retry } = {}
) {
  const token = localStorage.getItem("accessToken");
  const m = (method || "GET").toUpperCase();
  const isGet = m === "GET";
  const url = buildUrl(path, { ...(params || {}), _ts: Date.now() });

  let res;
  try {
    res = await fetch(url, {
      method: m,
      credentials: "same-origin", // لا ترسل كوكيز بين الدومينات
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(isGet ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        !isGet && body
          ? typeof body === "string"
            ? body
            : JSON.stringify(body)
          : undefined,
    });
  } catch (e) {
    console.error("HTTP request failed (network)", {
      url,
      message: e?.message,
    });
    throw new Error("Network error — check API URL / CORS / server status");
  }

  // محاولة ريفريش لمرة وحدة لو 401
  if (res.status === 401 && !_retry) {
    try {
      await ApiService.refresh(); // يحاول يحدّث التوكن
      return httpRequest(path, { method, body, headers, params, _retry: true });
    } catch {
      // فشل الريفريش → نكمل خطأ 401
    }
  }

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {}
  } else if (contentType.includes("text/")) {
    try {
      data = await res.text();
    } catch {}
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      res.statusText ||
      "Request failed";
    const err = new Error(`${res.status} ${message}`);
    console.error("HTTP error", { url, status: res.status, message, data });
    throw err;
  }
  return data;
}

// للتنزيلات (CSV)
async function downloadFile(path, { params, filename }) {
  const url = buildUrl(path, { ...(params || {}), _ts: Date.now() });
  const res = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "text/csv,application/octet-stream" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || res.statusText || "Download failed";
    console.error("Download error", { url, status: res.status, message });
    throw new Error(message);
  }
  const blob = await res.blob();
  const dlName =
    filename ||
    res.headers
      .get("content-disposition")
      ?.split("filename=")?.[1]
      ?.replace(/"/g, "") ||
    "download.csv";

  const a = document.createElement("a");
  const urlBlob = window.URL.createObjectURL(blob);
  a.href = urlBlob;
  a.download = dlName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);
}

// ====== PDF (Invoice) ======
async function getOrderInvoicePdfBlob(orderId) {
  const token = localStorage.getItem("accessToken");
  const url = buildUrl(`/orders/${orderId}/invoice.pdf`, { _ts: Date.now() });
  const res = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/pdf",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || res.statusText || "Failed to fetch invoice PDF";
    throw new Error(`${res.status} ${msg}`);
  }
  return res.blob();
}

const ApiService = {
  request: httpRequest,

  // ===== Auth =====
  async login({ email, password }) {
    const data = await httpRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const token = data?.token || data?.accessToken;
    if (token) {
      localStorage.setItem("accessToken", token);
      scheduleRefresh(token);
    }
    return data;
  },

  async refresh() {
    const data = await fetch(buildUrl("/auth/refresh", { _ts: Date.now() }), {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || "Refresh failed");
      return j;
    });

    const token = data?.token || data?.accessToken;
    if (!token) throw new Error("No token from refresh");
    localStorage.setItem("accessToken", token);
    scheduleRefresh(token);
    return { ok: true };
  },

  async logout() {
    try {
      await httpRequest("/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("accessToken");
    clearTimeout(refreshTimerId);
    return { success: true };
  },

  // ===== Catalog =====
  async getProducts(params) {
    const res = await httpRequest("/products", { params });
    if (Array.isArray(res))
      return { items: res, total: res.length, totalPages: 1, page: 1 };
    return res;
  },
  async getProduct(idOrSlug) {
    return httpRequest(`/products/${idOrSlug}`);
  },
  async getProductById(idOrSlug) {
    return httpRequest(`/products/${idOrSlug}`);
  },

  // ===== Categories =====
  async getCategories(params) {
    return httpRequest("/categories", { params });
  },
  async getCategory(idOrSlug) {
    return httpRequest(`/categories/${idOrSlug}`);
  },
  async createCategory(payload) {
    return httpRequest("/categories", { method: "POST", body: payload });
  },
  async updateCategory(idOrSlug, payload) {
    return httpRequest(`/categories/${idOrSlug}`, {
      method: "PUT",
      body: payload,
    });
  },
  async deleteCategory(idOrSlug) {
    return httpRequest(`/categories/${idOrSlug}`, { method: "DELETE" });
  },

  // ===== Orders =====
  async createOrder(payload) {
    return httpRequest("/orders", { method: "POST", body: payload });
  },
  async getOrder(id) {
    return httpRequest(`/orders/${id}`);
  },
  async getOrders(params) {
    return httpRequest("/orders", { params });
  },
  async updateOrder(idOrSlug, payload) {
    // غيّر PUT إلى PATCH إذا باك-إندك يستخدم PATCH
    return httpRequest(`/orders/${idOrSlug}`, { method: "PUT", body: payload });
  },
  async exportOrdersCSV(params) {
    return downloadFile("/orders/export.csv", {
      params,
      filename: "orders.csv",
    });
  },

  // ===== CSV =====
  async exportProductsCSV(params) {
    return downloadFile("/products/export.csv", {
      params,
      filename: "products.csv",
    });
  },
  async importProductsCSV(file, { upsertBy = "slug", dryRun = false } = {}) {
    const url = buildUrl("/products/import", { _ts: Date.now() });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upsertBy", upsertBy);
    fd.append("dryRun", String(dryRun));

    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.error || data?.message || "Import failed");
    return data;
  },

  // ===== Invoice PDF =====
  getOrderInvoicePdfBlob,
};

// جولة أولى: لو في توكن محفوظ، جدول ريفريش
(() => {
  const token = localStorage.getItem("accessToken");
  if (token) scheduleRefresh(token);
})();

export default ApiService;
