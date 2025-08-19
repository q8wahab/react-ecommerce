// src/services/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function buildUrl(path, params) {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function httpRequest(path, { method = 'GET', body, headers, params } = {}) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(buildUrl(path, params), {
    method,
    credentials: 'include', // لو عندك كوكي refresh
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (data && data.error) || (data && data.message) || res.statusText;
    throw new Error(message);
  }
  return data;
}

const ApiService = {
  // يحافظ على نفس الواجهة المستعملة في مشروعك
  async request(url, options) {
    return httpRequest(url, options);
  },

  // auth
  async logout() {
    await httpRequest('/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    return { success: true };
  },

  // products
  async getProducts(params) {
    return httpRequest('/products', { params });
  },
  async getProduct(id) {
    return httpRequest(`/products/${id}`);
  },

  // categories
  async getCategories() {
    return httpRequest('/categories');
  },

  // (اختياري) ممكن تضيف هنا رفع/حذف الصور إن احتجته لاحقًا
};

export default ApiService;
