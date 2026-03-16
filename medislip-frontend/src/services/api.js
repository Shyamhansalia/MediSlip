// ─── MediSlip API Service ──────────────────────────────────────────────────
// All communication with the backend goes through here.
// Token is stored in localStorage ONLY for the auth token (not user data).

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── helpers ────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');

const headers = (withAuth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const request = async (method, path, body = null, auth = true) => {
  const opts = { method, headers: headers(auth) };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (payload) => request('POST', '/auth/register', payload, false),
  login:    (payload) => request('POST', '/auth/login',    payload, false),
  sendForgotPasswordOTP: (payload) => request('POST', '/auth/forgot-password/send-otp', payload, false),
  resetPassword: (payload) => request('POST', '/auth/forgot-password/reset', payload, false),
  getMe:    ()        => request('GET',  '/auth/me'),
  updateMe: (payload) => request('PUT',  '/auth/me', payload),
  sendOTP:   (payload) => request('POST', '/auth/send-otp',   payload, false),
  verifyOTP: (payload) => request('POST', '/auth/verify-otp', payload, false),
  logout:   ()        => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },
};

// ── Medical Requests ───────────────────────────────────────────────────────
export const requestsAPI = {
  // Student: submit a new request
  submit: (payload) => request('POST', '/requests', payload),

  // Student: get own requests
  myRequests: () => request('GET', '/requests/my'),

  // HOD: get department requests
  departmentRequests: () => request('GET', '/requests/department'),

  // HOD: approve
  approve: (id) => request('PUT', `/requests/${id}/approve`),

  // HOD: reject
  reject: (id, reason) => request('PUT', `/requests/${id}/reject`, { rejectionReason: reason }),

  // Hospital: verify by studentId
  verify: (studentId) => request('GET', `/requests/verify/student/${studentId}`),

  // Hospital: mark approved slip as verified
  confirmVerification: (approvalId) => request('PUT', `/requests/verify/${approvalId}/confirm`),
};

// ── Session helpers ────────────────────────────────────────────────────────
export const saveSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getSession = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

export default { authAPI, requestsAPI, saveSession, getSession, clearSession };

// ── OTP (added) ────────────────────────────────────────────────────────────
export const otpAPI = {
  sendOTP:   (payload) => request('POST', '/auth/send-otp',   payload, false),
  verifyOTP: (payload) => request('POST', '/auth/verify-otp', payload, false),
};
