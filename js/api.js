const apiBase = '/api';

const getToken = () => {
  const token = localStorage.getItem('ecotrackToken');
  return token && token !== 'undefined' && token !== 'null' ? token : null;
};
const setToken = (token) => {
  if (token) {
    localStorage.setItem('ecotrackToken', token);
  }
};
const clearToken = () => localStorage.removeItem('ecotrackToken');

const authHeaders = () => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    // Fall back when the response body is not valid JSON
  }
  if (res.status === 401) {
    clearToken();
  }
  if (!res.ok) throw new Error((data && data.message) || 'Error en la API');
  return data;
};

const register = (nombre, email, password) =>
  request(`${apiBase}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });

const login = (email, password) =>
  request(`${apiBase}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

const profile = () => {
  console.log('Llamando a profile con token:', getToken());
  return request(`${apiBase}/usuarios/me`, { headers: authHeaders() });
};
const getActivities = () => request(`${apiBase}/actividades`, { headers: authHeaders() });
const createActivity = (activity) =>
  request(`${apiBase}/actividades`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(activity),
  });
const getRanking = () => request(`${apiBase}/estadisticas/ranking`, { headers: authHeaders() });
const saveMeta = (objetivoCO2) =>
  request(`${apiBase}/estadisticas/metas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ objetivoCO2 }),
  });
const getMeta = () => request(`${apiBase}/estadisticas/metas`, { headers: authHeaders() });
const suggestRoute = (routeData) =>
  request(`${apiBase}/actividades/sugerir`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(routeData),
  });

window.EcoTrackAPI = {
  register,
  login,
  profile,
  getActivities,
  createActivity,
  getRanking,
  saveMeta,
  getMeta,
  suggestRoute,
  getToken,
  setToken,
  clearToken,
};
