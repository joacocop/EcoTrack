const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  semana: { type: String, required: true },
  objetivoCO2: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

metaSchema.index({ userId: 1, semana: 1 }, { unique: true });

module.exports = mongoose.model('Meta', metaSchema);
