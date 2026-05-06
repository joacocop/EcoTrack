const apiBase = '/api';

const getToken = () => localStorage.getItem('ecotrackToken');
const setToken = (token) => localStorage.setItem('ecotrackToken', token);
const clearToken = () => localStorage.removeItem('ecotrackToken');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en la API');
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

const profile = () => request(`${apiBase}/usuarios/me`, { headers: authHeaders() });
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

window.EcoTrackAPI = {
  register,
  login,
  profile,
  getActivities,
  createActivity,
  getRanking,
  saveMeta,
  getMeta,
  getToken,
  setToken,
  clearToken,
};
