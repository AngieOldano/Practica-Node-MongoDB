const Producto = require('../models/Producto');

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find(); // Utilizamos el método find() del modelo Producto para obtener todos los productos de la base de datos
    res.status(200).json(productos); // Enviamos los productos obtenidos como respuesta en formato JSON
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos", error: error.message });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
   const { id } = req.params; // Obtenemos el ID del producto desde los parámetros de la solicitud
   const producto = await Producto.findById(id); // Utilizamos el método findById() del modelo Producto para buscar el producto por su ID en la base de datos
   if (!producto) {
     return res.status(404).json({ error: "Producto no encontrado" });
   }
    res.status(200).json(producto); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" }); 
  }
};

const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body); // Utilizamos el método create() del modelo Producto para crear un nuevo producto en la base de datos con los datos proporcionados en el cuerpo de la solicitud
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto", error: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params; 
    const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({message: "Producto actualizado correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto", error: error.message });
  }
}; 

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params; 
    const productoEliminado = await Producto.findByIdAndDelete(id); 
    if (!productoEliminado) { 
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({message: "Producto eliminado correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto", error: error.message });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
