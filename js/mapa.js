const map = L.map('map').setView([-34.6, -58.4], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);
const markers = L.layerGroup().addTo(map);

const updateMap = (actividades) => {
  markers.clearLayers();
  actividades.forEach((actividad) => {
    if (actividad.ubicacion?.coordinates?.length === 2) {
      const [lng, lat] = actividad.ubicacion.coordinates;
      const marker = L.marker([lat, lng]);
      marker.bindPopup(`<strong>${actividad.tipo}</strong><br>${actividad.huellaCO2} kg CO2`);
      marker.addTo(markers);
    }
  });
  if (actividades.length > 0) {
    const first = actividades[0];
    if (first.ubicacion?.coordinates?.length === 2) {
      map.setView([first.ubicacion.coordinates[1], first.ubicacion.coordinates[0]], 10);
    }
  }
};

const showActivities = async () => {
  try {
    const activities = await window.EcoTrackAPI.getActivities();
    updateMap(activities);
    const list = document.getElementById('activitiesList');
    list.innerHTML = activities
      .map(
        (item) => `
          <div class="activity-card">
            <strong>${item.tipo}</strong>
            <p>${item.huellaCO2} kg CO2</p>
            <p>${new Date(item.fecha).toLocaleString()}</p>
          </div>`
      )
      .join('');
  } catch (error) {
    console.error(error);
  }
};

window.MapController = {
  updateMap,
  showActivities,
};
