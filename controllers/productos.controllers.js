const Producto = require('../models/Producto');
const Etiqueta = require('../models/Etiqueta');
const { redisClient } = require('../config/redis');


const obtenerProductos = async (req, res) => {
  try {
    //Base de datos de Redis
    const productosEnCache = await redisClient.get("productos"); // Intentamos obtener los productos desde Redis utilizando el método get() del cliente de Redis
    if (productosEnCache) {
      console.log("Productos obtenidos desde Redis");
      return res.status(200).json({
        origen: "redis",
        productos: JSON.parse(productosEnCache)
      });
    }
    //Base de datos de MongoDB
    const productos = await Producto.find() // Utilizamos el método find() del modelo Producto para obtener todos los productos de la base de datos
      .populate('categoria', 'nombre -_id') // Utilizamos el método populate() para reemplazar el id de la categoria por nombre de la categoria
      .populate('etiquetas', 'nombre -_id')
      .select('-createdAt -updatedAt -__v'); // Excluimos los campos createdAt, updatedAt y __v de la respuesta
    await redisClient.set("productos", JSON.stringify(productos), { EX: 60 }); // Guardamos los productos obtenidos en Redis utilizando el método set() del cliente de Redis, convirtiendo el array de productos a una cadena JSON con JSON.stringify() y estableciendo un tiempo de expiración de 60 segundos con la opción EX
    console.log("Productos obtenidos desde MongoDB y guardados en Redis");
    res.status(200).json(productos); // Enviamos los productos obtenidos como respuesta en formato JSON
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos", error: error.message });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
   const { id } = req.params; // Obtenemos el ID del producto desde los parámetros de la solicitud
   const claveCache = `producto:${id}`; // Creamos una clave única para el producto en Redis utilizando su ID
   const productoEnCache = await redisClient.get(claveCache); // Intentamos obtener el producto desde Redis utilizando la clave única
    if (productoEnCache) {
      console.log("Producto obtenido desde Redis");
      return res.status(200).json({
        origen: "redis",
        producto: JSON.parse(productoEnCache)
      });
    }
   const producto = await Producto.findById(id) // Utilizamos el método findById() del modelo Producto para buscar el producto por su ID en la base de datos
    .populate('categoria', 'nombre -_id')
    .populate('etiquetas', 'nombre -_id');
   if (!producto) {
     return res.status(404).json({ error: "Producto no encontrado" });
   }
   console.log("Producto obtenido desde MongoDB");
   await redisClient.set(claveCache, JSON.stringify(producto), { EX: 60 });
    res.status(200).json(producto); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" }); 
  }
};

const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body); // Utilizamos el método create() del modelo Producto para crear un nuevo producto en la base de datos con los datos proporcionados en el cuerpo de la solicitud
    await redisClient.del("productos"); // Eliminamos la clave "productos" de Redis utilizando el método del() del cliente de Redis para asegurarnos de que la próxima vez que se soliciten los productos se obtengan los datos actualizados desde MongoDB
    const claveCache = `producto:${nuevoProducto._id}`; 
  await redisClient.del(claveCache);
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
    await redisClient.del("productos"); // eliminamos la clave "productos" de Redis para asegurarnos de que la próxima vez que se soliciten los productos se obtengan los datos actualizados desde MongoDB
    const claveCache = `producto:${id}`; // hacemos lo mismo con la clave específica del producto actualizado en Redis para asegurarnos de que no se obtenga información obsoleta en futuras solicitudes
    await redisClient.del(claveCache); 
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
    await redisClient.del("productos"); 
    const claveCache = `producto:${id}`; // Creamos la clave única para el producto eliminado en Redis utilizando su ID
    await redisClient.del(claveCache); // Eliminamos la clave específica del producto eliminado en Redis para asegurarnos de que no se obtenga información obsoleta en futuras solicitudes
    res.status(200).json({message: "Producto eliminado correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto", error: error.message });
  }
};

const agregarImagen = async (req, res) => {
  try {    
    const { id } = req.params; // el usuario envia el id del producto al que quiere agregar la imagen
    const producto = await Producto.findById(id); // buscamos el producto por su id
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    producto.imagenes.push(req.body); // agregamos la imagen al array de imagenes del producto
    await producto.save();
    await redisClient.del("productos");
    const claveCache = `producto:${id}`;
    await redisClient.del(claveCache);
    res.status(200).json({message: "Imagen agregada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al agregar la imagen", error: error.message });
  }
};


const eliminarImagen = async (req, res) => {
  try {    
    const { id, imagenId } = req.params; // el usuario envia el id del producto y el id de la imagen que quiere eliminar
    const producto = await Producto.findById(id); // buscamos el producto por su id
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    producto.imagenes = producto.imagenes.filter(imagen => imagen._id.toString() !== imagenId); // filtramos las imagenes del producto para quedarnos solo con las que no tienen el id de la imagen que queremos eliminar
    await producto.save();
    await redisClient.del("productos");
    const claveCache = `producto:${id}`;
    await redisClient.del(claveCache);
    res.status(200).json({message: "Imagen eliminada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la imagen", error: error.message });
  }
};


const agregarEtiqueta = async (req, res) => {
 try{
  const { id, etiquetaId } = req.params; // el usuario envia el id del producto y el id de la etiqueta que quiere agregar
  const producto = await Producto.findById(id);
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  const etiqueta = await Etiqueta.findById(etiquetaId); // buscamos la etiqueta por su id para verificar que exista antes de agregarla al producto
  if (!etiqueta) {
    return res.status(404).json({ error: "Etiqueta no encontrada" });
  }
  producto.etiquetas.addToSet(etiquetaId); // agregamos la etiqueta al array de etiquetas del producto
  await producto.save();
  await redisClient.del("productos");
  const claveCache = `producto:${id}`;
  await redisClient.del(claveCache);
  res.status(200).json({message: "Etiqueta agregada correctamente"});
 }catch (error) { 
  res.status(500).json({ error: "Error al agregar la etiqueta", error: error.message });
  }
};

const eliminarEtiqueta = async (req, res) => {
  try {
    const { id, etiquetaId } = req.params;
    const producto = await Producto.findById(id);1
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const etiqueta = await Etiqueta.findById(etiquetaId);
    if (!etiqueta) {
      return res.status(404).json({ error: "Etiqueta no encontrada" });
    }
    producto.etiquetas = producto.etiquetas.filter(etiqueta => etiqueta.toString() !== etiquetaId);
    await producto.save();
    await redisClient.del("productos");
    const claveCache = `producto:${id}`;
    await redisClient.del(claveCache);
    res.status(200).json({message: "Etiqueta eliminada correctamente"});
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la etiqueta", error: error.message });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  agregarImagen,
  eliminarImagen,
  agregarEtiqueta,
  eliminarEtiqueta
}
