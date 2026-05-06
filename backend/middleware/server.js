const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const usuariosRoutes = require('../routes/usuarios');
const actividadesRoutes = require('../routes/actividades');
const estadisticasRoutes = require('../routes/estadisticas');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/js', express.static(path.resolve(__dirname, '..', '..', 'js')));
app.use('/css', express.static(path.resolve(__dirname, '..', '..', 'css')));
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use(express.static(path.resolve(__dirname, '..', '..', 'frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
