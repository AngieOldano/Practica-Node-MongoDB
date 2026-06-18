const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  agregarImagen,
  eliminarImagen,
  agregarEtiqueta,
  eliminarEtiqueta
} = require("../controllers/productos.controllers");

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

router.post("/:id/imagenes", agregarImagen);
router.delete("/:id/imagenes/:imagenId", eliminarImagen);

router.post("/:id/etiquetas/:etiquetaId", agregarEtiqueta);
router.delete("/:id/etiquetas/:etiquetaId", eliminarEtiqueta);

module.exports = router;
