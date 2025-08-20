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

  // منع الـ 304 والكاش
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

const ApiService = {
  request: httpRequest,

  // Auth
  async logout() {
    await httpRequest('/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    return { success: true };
  },

  // Catalog
  async getProducts(params) {
    const res = await httpRequest('/products', { params });
    if (Array.isArray(res)) {
      return { items: res, total: res.length, totalPages: 1, page: 1 };
    }
    return res;
  },
  async getProduct(idOrSlug) { return httpRequest(`/products/${idOrSlug}`); },
  async getCategories() { return httpRequest('/categories'); },

  // Orders
  async createOrder(payload) {
    // payload example:
    // {
    //   customer: { name, phone, email? },
    //   shippingAddress: { area, block, street, avenue?, houseNo, notes? },
    //   items: [{ product: '<id>', qty }]
    // }
    return httpRequest('/orders', { method: 'POST', body: payload });
  },
  async getOrder(id) { // ملاحظة: هذا الراوت محمي بـ requireAuth في الباك-إند
    return httpRequest(`/orders/${id}`);
  },
};

export default ApiService;
