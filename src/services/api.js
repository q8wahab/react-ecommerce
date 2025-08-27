// src/services/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function buildUrl(path, params) {
  const url = new URL(
    path.startsWith('http')
      ? path
      : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  );
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function httpRequest(path, { method = 'GET', body, headers = {}, params } = {}) {
  const token = localStorage.getItem('accessToken');
  const m = (method || 'GET').toUpperCase();
  const isGet = m === 'GET';

  const url = buildUrl(path, { ...(params || {}), _ts: Date.now() });

  const res = await fetch(url, {
    method: m,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(isGet ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: !isGet && body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    try { data = await res.json(); } catch {}
  } else if (contentType.includes('text/')) {
    try { data = await res.text(); } catch {}
  }

  if (!res.ok) {
    const message = (data && data.error) || (data && data.message) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

// خاص للتنزيلات (CSV)
async function downloadFile(path, { params, filename }) {
  const token = localStorage.getItem('accessToken');
  const url = buildUrl(path, { ...(params || {}), _ts: Date.now() });

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = text || res.statusText || 'Download failed';
    throw new Error(message);
  }

  const blob = await res.blob();
  const dlName =
    filename ||
    res.headers.get('content-disposition')?.split('filename=')?.[1]?.replace(/"/g, '') ||
    'download.csv';

  const a = document.createElement('a');
  const urlBlob = window.URL.createObjectURL(blob);
  a.href = urlBlob;
  a.download = dlName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);
}

const ApiService = {
  request: httpRequest,

  // ===== Auth =====
  async login({ email, password }) {
    const data = await httpRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    const token = data?.token || data?.accessToken;
    if (token) localStorage.setItem('accessToken', token);
    return data;
  },

  async logout() {
    try {
      await httpRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('accessToken');
    }
    return { success: true };
  },

  // ===== Catalog =====
  async getProducts(params) {
    const res = await httpRequest('/products', { params });
    if (Array.isArray(res)) {
      return { items: res, total: res.length, totalPages: 1, page: 1 };
    }
    return res;
  },
  async getProduct(idOrSlug) { return httpRequest(`/products/${idOrSlug}`); },
  async getCategories() { return httpRequest('/categories'); },

  // ===== Orders =====
  async createOrder(payload) {
    return httpRequest('/orders', { method: 'POST', body: payload });
  },
  async getOrder(id) {
    return httpRequest(`/orders/${id}`);
  },

  // ===== CSV: Export / Import =====
  async exportProductsCSV(params) {
    return downloadFile('/products/export.csv', { params, filename: 'products.csv' });
  },

  async importProductsCSV(file, { upsertBy = 'slug', dryRun = false } = {}) {
    const token = localStorage.getItem('accessToken');
    const url = buildUrl('/products/import', { _ts: Date.now() });

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upsertBy', upsertBy);
    fd.append('dryRun', String(dryRun));

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // لا تضع Content-Type — المتصفح سيحدد boundary
      },
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.error || data?.message || 'Import failed';
      throw new Error(message);
    }
    return data;
  },
};

export default ApiService;
