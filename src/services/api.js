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

async function httpRequest(path, { method = 'GET', body, headers = {}, params } = {}) {
  const token = localStorage.getItem('accessToken');
  const m = (method || 'GET').toUpperCase();
  const isGet = m === 'GET';

  // 👇 نضيف مُعرِّف وقت لمنع 304 من الكاش + نستخدم cache: 'no-store'
  const url = buildUrl(path, { ...(params || {}), _ts: Date.now() });

  const res = await fetch(url, {
    method: m,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(isGet ? {} : { 'Content-Type': 'application/json' }), // لا ترسل Content-Type مع GET
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
    // 304 وغيره → نطلع برسالة مفهومة
    const message = (data && data.error) || (data && data.message) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

const ApiService = {
  request: httpRequest,
  async logout() { await httpRequest('/auth/logout', { method: 'POST' }); localStorage.removeItem('accessToken'); return { success: true }; },
async getProducts(params) {
  const res = await httpRequest('/products', { params });
     // لو السيرفر رجّع مصفوفة مباشرة، غلفها لشكل موحد
  if (Array.isArray(res)) {
    return { items: res, total: res.length, totalPages: 1, page: 1 };
  }
  return res; // وإلا ارجع كما هي (items/total/...)
},
  async getProduct(id) { return httpRequest(`/products/${id}`); },
  async getCategories() { return httpRequest('/categories'); },
};
export default ApiService;
