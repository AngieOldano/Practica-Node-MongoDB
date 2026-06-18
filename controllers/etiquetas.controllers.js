const Etiqueta = require('../models/Etiqueta');

const obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await Etiqueta.find()
     .select('-__v -updatedAt -createdAt '); 
    res.status(200).json(etiquetas); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las etiquetas", error: error.message });
  }
};

const obtenerEtiquetaPorId = async (req, res) => {
  try {
   const { id } = req.params;
   const etiqueta = await Etiqueta.findById(id)
    .select('-__v -updatedAt -createdAt ');
   if (!etiqueta) {
     return res.status(404).json({ error: "Etiqueta no encontrada" });
   }
    res.status(200).json(etiqueta); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la etiqueta" }); 
  }
};

const crearEtiqueta = async (req, res) => {
  try {
    const nuevaEtiqueta = await Etiqueta.create(req.body); 
    res.status(201).json(nuevaEtiqueta);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la etiqueta", error: error.message });
  }
};

const actualizarEtiqueta = async (req, res) => {
  try {
    const { id } = req.params; 
    const etiquetaActualizada = await Etiqueta.findByIdAndUpdate(id, req.body, { 
     new: true, 
     runValidators: true 
    });
    if (!etiquetaActualizada) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }
    res.status(200).json({message: "Etiqueta actualizada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la etiqueta", error: error.message });
  }
}; 

const eliminarEtiqueta  = async (req, res) => {
  try {
    const { id } = req.params; 
    const etiquetaEliminada = await Etiqueta.findByIdAndDelete(id); 
    if (!etiquetaEliminada) { 
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }
    res.status(200).json({message: "Etiqueta eliminada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la etiqueta", error: error.message });
  }
};



module.exports = {
  obtenerEtiquetas,
  obtenerEtiquetaPorId,
  crearEtiqueta,
  actualizarEtiqueta,
  eliminarEtiqueta
};
