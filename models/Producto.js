const mongoose = require('mongoose');

const imagenSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria'] //obligatorio
  },
  descripcion: {
    type: String,
    required: false, //opcional
    trim: true
  }
});

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo']
  },
  categoria: { // relacion 1 a N
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es obligatoria']
  },
  etiquetas: [{ // relacion N a N
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etiqueta'
  }],
  imagenes: [imagenSchema] // Incrustamos el esquema de la imagen dentro del esquema del producto
},{  
  timestamps: true
  
});


const Producto = mongoose.model('Producto', productoSchema);
module.exports = Producto;
