const moongoose = require('mongoose');

const etiquetaSchema = new moongoose.Schema(
 {
  nombre: {
    type: String,
    required: [true, 'El nombre de la etiqueta es obligatorio'],
    trim: true,
    unique: true
  },
  descripcion: {
    type: String,
    trim: true
  }
 },
 {
  timestamps: true
 }
);

const Etiqueta = moongoose.model('Etiqueta', etiquetaSchema);
module.exports = Etiqueta;
