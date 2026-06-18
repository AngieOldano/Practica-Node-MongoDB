const Categoria = require('../models/Categoria');

const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.status(200).json(categorias); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las categorias", error: error.message });
  }
};

const obtenerCategoriaPorId = async (req, res) => {
  try {
   const { id } = req.params;
   const categoria = await Categoria.findById(id);
   if (!categoria) {
     return res.status(404).json({ error: "Categoria no encontrada" });
   }
    res.status(200).json(categoria); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la categoria" }); 
  }
};

const crearCategoria = async (req, res) => {
  try {
    const nuevaCategoria = await Categoria.create(req.body); 
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la categoria", error: error.message });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params; 
    const categoriaActualizada = await Categoria.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!categoriaActualizada) {
      return res.status(404).json({ error: "Categoria no encontrada" });
    }
    res.status(200).json({message: "Categoria actualizada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la categoria", error: error.message });
  }
}; 

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params; 
    const categoriaEliminada = await Categoria.findByIdAndDelete(id); 
    if (!categoriaEliminada) { 
      return res.status(404).json({ error: "Categoria no encontrada" });
    }
    res.status(200).json({message: "Categoria eliminada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoria", error: error.message });
  }
};



module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};
