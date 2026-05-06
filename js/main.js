const authPanel = document.getElementById('authPanel');
const dashboard = document.getElementById('dashboard');
const userName = document.getElementById('userName');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutButton = document.getElementById('logoutButton');
const activityForm = document.getElementById('activityForm');
const activityType = document.getElementById('activityType');
const detailsFields = document.getElementById('detailsFields');
const activitiesList = document.getElementById('activitiesList');
const rankingList = document.getElementById('rankingList');
const metaForm = document.getElementById('metaForm');
const metaValueInput = document.getElementById('metaValue');
const metaInfo = document.getElementById('metaInfo');
const weeklyCO2 = document.getElementById('weeklyCO2');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const nav = document.getElementById('nav');
const scrollToActivity = document.getElementById('scrollToActivity');
const scrollToMap = document.getElementById('scrollToMap');
const scrollToStats = document.getElementById('scrollToStats');

const renderDetailsFields = () => {
  const type = activityType.value;
  let template = '';

  if (type === 'transporte') {
    template = `
      <label>Vehículo</label>
      <select id="vehicleType" required>
        <option value="auto">Auto</option>
        <option value="moto">Moto</option>
        <option value="bus">Bus</option>
        <option value="bici">Bici</option>
      </select>
      <label>Distancia (km)</label>
      <input type="number" id="distanceKm" step="any" min="0" required />
      <label>Combustible</label>
      <select id="fuelType">
        <option value="nafta">Nafta</option>
        <option value="diesel">Diésel</option>
        <option value="electrico">Eléctrico</option>
      </select>
    `;
  }

  if (type === 'electricidad') {
    template = `
      <label>Consumo (kWh)</label>
      <input type="number" id="consumoKwh" step="any" min="0" required />
    `;
  }

  if (type === 'alimentacion') {
    template = `
      <label>Tipo de comida</label>
      <select id="foodType" required>
        <option value="carne">Carne</option>
        <option value="vegetariano">Vegetariano</option>
        <option value="vegano">Vegano</option>
      </select>
    `;
  }

  if (type === 'residuos') {
    template = `
      <label>Kg de residuos</label>
      <input type="number" id="wasteKg" step="any" min="0" required />
    `;
  }

  detailsFields.innerHTML = template;
};

const showUI = async () => {
  try {
    const profile = await window.EcoTrackAPI.profile();
    authPanel.classList.add('hidden');
    dashboard.classList.remove('hidden');
    nav.classList.remove('hidden');
    userName.textContent = `Hola, ${profile.nombre}`;
    await refreshDashboard();
  } catch (error) {
    clearToken();
    authPanel.classList.remove('hidden');
    dashboard.classList.add('hidden');
    nav.classList.add('hidden');
  }
};

const refreshDashboard = async () => {
  try {
    const activities = await window.EcoTrackAPI.getActivities();
    window.MapController.updateMap(activities);
    window.MapController.showActivities();
  } catch (error) {
    console.error('Error cargando actividades:', error);
  }

  try {
    const ranking = await window.EcoTrackAPI.getRanking();
    rankingList.innerHTML = ranking
      .map(
        (item, index) => `
          <div class="activity-card">
            <strong>#${index + 1} ${item.usuario.nombre}</strong>
            <p>${item.totalCO2.toFixed(2)} kg CO2</p>
          </div>`
      )
      .join('');
  } catch (error) {
    console.error('Error cargando ranking:', error);
    rankingList.innerHTML = '<p>No se pudo cargar el ranking.</p>';
  }

  try {
    const meta = await window.EcoTrackAPI.getMeta();
    const currentMeta = meta.meta || null;
    const progreso = meta.progreso || { totalCO2: 0, count: 0 };

    if (currentMeta) {
      metaInfo.textContent = `Meta semanal: ${currentMeta.objetivoCO2} kg CO2`;
      metaValueInput.value = currentMeta.objetivoCO2;
    } else {
      metaInfo.textContent = 'Cargar meta';
      metaValueInput.value = '';
    }
    weeklyCO2.textContent = `${(progreso.totalCO2 || 0).toFixed(2)} kg CO2`;
  } catch (error) {
    console.error('Error cargando meta:', error);
    metaInfo.textContent = 'Error cargando meta';
    weeklyCO2.textContent = '0 kg CO2';
  }
};

const buildDetails = () => {
  const type = activityType.value;
  const details = {};

  if (type === 'transporte') {
    details.vehiculo = document.getElementById('vehicleType').value;
    details.distanciaKm = Number(document.getElementById('distanceKm').value);
    details.combustible = document.getElementById('fuelType').value;
  }
  if (type === 'electricidad') {
    details.consumoKwh = Number(document.getElementById('consumoKwh').value);
  }
  if (type === 'alimentacion') {
    details.tipoComida = document.getElementById('foodType').value;
  }
  if (type === 'residuos') {
    details.kgResiduos = Number(document.getElementById('wasteKg').value);
  }

  return details;
};

activityType.addEventListener('change', renderDetailsFields);

showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
});

scrollToActivity.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('activityForm').scrollIntoView({ behavior: 'smooth' });
});

scrollToMap.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
});

scrollToStats.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('rankingList').scrollIntoView({ behavior: 'smooth' });
});

logoutButton.addEventListener('click', () => {
  clearToken();
  authPanel.classList.remove('hidden');
  dashboard.classList.add('hidden');
  nav.classList.add('hidden');
  loginSection.classList.remove('hidden');
  registerSection.classList.add('hidden');
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const data = await window.EcoTrackAPI.login(email, password);
    setToken(data.token);
    await showUI();
  } catch (error) {
    alert(error.message);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const nombre = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const data = await window.EcoTrackAPI.register(nombre, email, password);
    setToken(data.token);
    await showUI();
  } catch (error) {
    alert(error.message);
  }
});

activityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const tipo = activityType.value;
    const lat = Number(document.getElementById('latInput').value);
    const lng = Number(document.getElementById('lngInput').value);
    const detalles = buildDetails();

    await window.EcoTrackAPI.createActivity({ tipo, detalles, lat, lng });
    activityForm.reset();
    renderDetailsFields();
    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  }
});

metaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const objetivoCO2 = Number(metaValueInput.value);
    if (Number.isNaN(objetivoCO2) || objetivoCO2 < 0) {
      return alert('Ingresa un valor válido para la meta');
    }

    const meta = await window.EcoTrackAPI.saveMeta(objetivoCO2);
    await refreshDashboard();
    metaValueInput.value = '';
    alert(`Meta guardada: ${meta.objetivoCO2} kg CO2 / semana`);
  } catch (error) {
    alert(error.message);
  }
});

renderDetailsFields();
if (getToken()) {
  showUI();
}
