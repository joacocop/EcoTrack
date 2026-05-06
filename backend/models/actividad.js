const mongoose = require('mongoose');

const actividadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  tipo: {
    type: String,
    enum: ['transporte', 'electricidad', 'alimentacion', 'residuos'],
    required: true,
  },
  detalles: {
    vehiculo: { type: String, enum: ['auto', 'moto', 'bus', 'bici'] },
    distanciaKm: { type: Number, min: 0 },
    combustible: { type: String, enum: ['nafta', 'diesel', 'electrico'] },
    consumoKwh: { type: Number, min: 0 },
    tipoComida: { type: String, enum: ['carne', 'vegetariano', 'vegano'] },
    kgResiduos: { type: Number, min: 0 },
  },
  ubicacion: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (coords) {
          return coords.length === 2;
        },
        message: 'Coordenadas inválidas',
      },
    },
  },
  huellaCO2: { type: Number, default: 0 },
  fecha: { type: Date, default: Date.now },
});

actividadSchema.index({ ubicacion: '2dsphere' });

actividadSchema.pre('save', function (next) {
  let co2 = 0;

  switch (this.tipo) {
    case 'transporte':
      if (this.detalles.vehiculo === 'auto') co2 = this.detalles.distanciaKm * 0.12;
      if (this.detalles.vehiculo === 'moto') co2 = this.detalles.distanciaKm * 0.06;
      if (this.detalles.vehiculo === 'bus') co2 = this.detalles.distanciaKm * 0.03;
      break;
    case 'electricidad':
      co2 = this.detalles.consumoKwh * 0.4;
      break;
    case 'alimentacion':
      if (this.detalles.tipoComida === 'carne') co2 = 7.2;
      if (this.detalles.tipoComida === 'vegetariano') co2 = 2.5;
      if (this.detalles.tipoComida === 'vegano') co2 = 1.5;
      break;
    case 'residuos':
      co2 = this.detalles.kgResiduos * 2.0;
      break;
    default:
      co2 = 0;
  }

  this.huellaCO2 = Number(co2.toFixed(2));
  next();
});

module.exports = mongoose.model('Actividad', actividadSchema);
