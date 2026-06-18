const express = require("express");
const router = express.Router();

const {
  obtenerEtiquetas,
  obtenerEtiquetaPorId,
  crearEtiqueta,
  actualizarEtiqueta,
  eliminarEtiqueta
} = require("../controllers/etiquetas.controllers");

router.get("/", obtenerEtiquetas);
router.get("/:id", obtenerEtiquetaPorId);
router.post("/", crearEtiqueta);
router.put("/:id", actualizarEtiqueta);
router.delete("/:id", eliminarEtiqueta);

module.exports = router;