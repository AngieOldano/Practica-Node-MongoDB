const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  agregarImagen,
  eliminarImagen
} = require("../controllers/productos.controllers");

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

router.post("/:id/imagenes", agregarImagen);
router.delete("/:id/imagenes/:imagenId", eliminarImagen);

module.exports = router;
