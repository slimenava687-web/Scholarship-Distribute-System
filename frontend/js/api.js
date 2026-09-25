const API_BASE_URL = 'http://localhost:5000/api';
const RATE_CACHE_KEY = 'eth_exchange_rate';
const RATE_CACHE_TTL = 10 * 60 * 1000;
const FALLBACK_ETH_RATE = { usd: 3000, vnd: 75000000, fetchedAt: 0, isFallback: true };
const CURRENCY_KEY = 'scholarship_display_currency';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'API request failed.');
  return data;
}

export async function getEthExchangeRate() {
  let cached = null;
  try {
    cached = JSON.parse(sessionStorage.getItem(RATE_CACHE_KEY) || 'null');
  } catch {
    sessionStorage.removeItem(RATE_CACHE_KEY);
  }

  if (cached && Date.now() - cached.fetchedAt < RATE_CACHE_TTL) {
    return cached;
  }

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,vnd');
    if (!response.ok) throw new Error('Unable to fetch ETH exchange rate.');

    const data = await response.json();
    const rate = {
      usd: Number(data.ethereum.usd),
      vnd: Number(data.ethereum.vnd),
      fetchedAt: Date.now(),
      isFallback: false
    };

    if (!Number.isFinite(rate.usd) || !Number.isFinite(rate.vnd)) throw new Error('Invalid ETH exchange rate.');
    sessionStorage.setItem(RATE_CACHE_KEY, JSON.stringify(rate));
    return rate;
  } catch (error) {
    return { ...FALLBACK_ETH_RATE, fetchedAt: Date.now() };
  }
}

export function getSelectedCurrency() {
  return sessionStorage.getItem(CURRENCY_KEY) === 'USD' ? 'USD' : 'VND';
}

export function setSelectedCurrency(currency) {
  const selected = currency === 'USD' ? 'USD' : 'VND';
  sessionStorage.setItem(CURRENCY_KEY, selected);
  return selected;
}

export const api = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  updateProfile: (payload, walletAddress) => apiRequest('/auth/profile', { method: 'PUT', headers: { 'x-wallet-address': walletAddress }, body: JSON.stringify(payload) }),
  scholarships: () => apiRequest('/scholarships'),
  myApplications: (walletAddress) => apiRequest('/applications/my-applications', { headers: { 'x-wallet-address': walletAddress } }),
  createApplication: (payload, walletAddress) => apiRequest('/applications', { method: 'POST', headers: { 'x-wallet-address': walletAddress }, body: JSON.stringify(payload) }),
  allApplications: (walletAddress) => apiRequest('/admin/applications', { headers: { 'x-wallet-address': walletAddress } }),
  createScholarship: (payload, walletAddress) => apiRequest('/scholarships', { method: 'POST', headers: { 'x-wallet-address': walletAddress }, body: JSON.stringify(payload) }),
  updateApplicationStatus: (id, payload, walletAddress) => {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    return apiRequest(`/admin/applications/${id}/status`, { method: 'PATCH', headers: { 'x-wallet-address': walletAddress }, body: JSON.stringify(body) });
  }
};
