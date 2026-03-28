// ══════════════════════════════════════════════════════════════
//  7 Ensemble — API client (frontend → backend)
//  Utilisé uniquement pour les paiements Stripe (Phase 2A)
//  Le reste du front continue en localStorage pour l'instant
// ══════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('7e_token');
}

export function setToken(token) {
  localStorage.setItem('7e_token', token);
}

export function clearToken() {
  localStorage.removeItem('7e_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

export const backendApi = {
  register: (form) => request('/auth/register', { method: 'POST', body: JSON.stringify(form) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  createCheckout: (data) => request('/payments/create-checkout', { method: 'POST', body: JSON.stringify(data) }),
  paymentStatus: (txId) => request(`/payments/status/${txId}`),
};
