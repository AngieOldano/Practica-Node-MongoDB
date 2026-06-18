# MongoDB
* Es una base de datos NoSQL orientada a documentos, es decir que los datos se almacenan en formato JSON.
  *  No hay registros en tablas, sino que hay colecciones de documentos JSON.
  * Hay mas flexibilidad a la hora de modelar los datos, no es necesario definir un esquema rigido como en bases de datos relacionales.
  * MongoDB se utiliza cuando en aplicaciones los datos cambian con frecuencia o cuando se necesita escalar horizontalmente o aplicaciones de tiempo real.
* Primero voy a crear el archivo de configuracion docker-compose.yml
* Voy a levantar 2 servicios, osea dos contenedores
```yml  
services:
  mongo:
    image: mongo:latest
    ports:
      - 27017:27017

    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123

    volumes:
      - ./data:/data/db

```
* Levanto mi servicio al que denomino mongo a partir de la imagen oficial de mongo, mongo corre en el puerto 27017 y tambien elijo exponer el puerto al exterior en el puerto 27017 
* Puedo pasarle variables de entorno con environment, en este caso le paso el usuario y la contraseña para acceder a la base de datos.
  * La doc de mongo me dice que para inicializar el usuario y la contraseña tengo que usar las variables de entorno MONGO_INITDB_ROOT_USERNAME y MONGO_INITDB_ROOT_PASSWORD
* En volumes hago que los datos de mongo se guarden en una carpeta local llamada data, esto es para que los datos persistan aunque el contenedor muera, si no hiciera esto cada vez que el contenedor muere se pierden los datos.
  * Abajo de todo defino el volumen mongo-data que es el que voy a usar para guardar los datos de mongo.
```yml  
  mongo-express:
    image: mongo-express:latest
    depends_on:
      - mongo
    ports:
      - 8081:8081

    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: admin123
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_BASICAUTH: false

volumes:
  mongo-data:
```
* mongo-express es un cliente conectarse a la bdd mongo, es una interfaz web para poder ver los datos de mongo.
* Tiene una dependencia con mongo, osea que no se levanta hasta que mongo este levantado

* Me ubico con el terminal donde esta el archivo docker-compose.yml y ejecuto el comando: docker-compose up -d
```bash
docker compose up -d
```
***NOTA: no necesito descargar antes las imagenes porque docker-compose las descarga automáticamente.***
* Si entro a http://localhost:8081/ puedo ver la interfaz de mongo-express y conectarme a la base de datos mongo con el usuario y contraseña que definí en el docker-compose.yml

## ODM y Mongoose
* Es un Object Document Mapper, es una libreria que me permite mapear los documentos de mongo a objetos de mi aplicacion, es decir que me permite trabajar con objetos en lugar de documentos JSON.
* El ODM es como el ORM para bases de datos relacionales
* El ODM mas popular para mongo es Mongoose, seria el equivalente a Sequelize para bases de datos relacionales.
* Mongoose me permite definir un esquema para mis documentos, es decir que me permite definir que campos van a tener mis documentos y que tipo de datos van a tener esos campos, esto es opcional pero es recomendable para tener una estructura mas organizada en la base de datos.

## Importante:
### Carpeta node_modules
* No subir a github la carpeta node_modules y el .env
* Para eso creamos un archivo .gitignore en la raiz del proyecto y dentro de ese archivo escribimos el nombre de la carpeta que queremos ignorar, en este caso node_modules y las variables de entorno que vamos a crear despues, quedando asi:
```
node_modules/
.env
```
***NOTA: podemos agregar al .gitignore cualquier archivo o carpeta que no queramos subir al github***


## Pasos
* Primero uso el comando npm init -i para inicializar el proyecto y crear el package.json
* Voy a crear el archivo de configuracion docker-compose.yml con la configuracion para levantar mongo y mongo-express
  * Puedo levantar los contenedores con el comando: docker-compose up -d
* Puedo instalar nodemon para el pruebas durante el desarrollo, para eso uso el comando: npm install -D nodemon
* Agrego al package.json en el script el start y el dev si uso nodemon para poder correr la api, quedando asi:
```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
},
```
* Instalo mongoose dotenv y express con el comando: npm install mongoose dotenv express
  * dotenv me permite cargar variables de entorno desde un archivo .env
  * express es un framework para crear aplicaciones web en node.js
* Creo la conexion usando mongoose para conectarnos con MongoDB
* Crear los schemas y modelos
* Creo los controladores
* Creo las rutas.

## Conexion a MongoDB
* Creo una carpeta llamada config y dentro de ella un archivo llamado db.js donde voy a configurar la conexion a mongo usando mongoose.
```js
const mongoose = require('mongoose'); 

const connectDB = async () => { // Creamos una función asíncrona para conectarnos a la base de datos
 try {
  await mongoose.connect(process.env.MONGO_URI);// Nos conectamos a la base de datos utilizando la URL de conexión que hemos definido en el archivo .env
  console.log('Conectado a MongoDB'); 
 } catch (error) {
  console.error('Error al conectar a MongoDB:', error.message);
 } 
};
```
* mongoose.connect es un metodo connect que recibe la URL de conexion a mongoDB, se la puedo pasar atras de una variable de entorno (el .env)
* En el .env defino la variable de entorno MONGO_URI con la URL de conexion a mongoDB, esta URL tiene la siguiente estructura: mongodb://usuario:contraseña@host:puerto/nombre-base-de-datos?authSource=admin
***IMPORTANTE: Las variables de entorno se utilizan para no exponer información sensible en el código fuente***
```
// .env
PORT=3000
MONGO_URI=mongodb://admin:admin123@localhost:27017/tienda?authSource=admin
```

## Relaciones
### Por Incrustacion
* La incrustacion es una tecnica que se utiliza para incluir un documento dentro de otro documento, es decir que un documento puede tener un campo que sea un documento o un array de documentos.
* Para incustrar un documentro dentro de otro documento, simplemente definimos el campo como un objeto o un array de objetos en el esquema del modelo, por ejemplo:
* Una ventaja es la simplicidad, ya que esto todo en un solo documento, no es necesario hacer consultas adicionales (como con join) para obtener los datos relacionados.
* Una desventaja es que no se puede compartir el "subdocumento", se crea una entidad que depende toalmente de la entidad principal. Si necesito esa subentidad tengo que primero traerme la entidad principal y luego acceder a la subentidad, no puedo acceder directamente a la subentidad como si fuera una entidad independiente.
* Me conviene usar incrustacion cuando tengo una entidad que depende fuertemente de la otra.

### Por Referencia
* En base de datos relacionales se llama clave foranea
* La referencia es una forma de relacionar documentos guardando el id de un documento dentro de otro documento.
* A diferencia de la incrustracion ahora los datos estan en documentos separados
* Usamos el metodo populate() de Mongoose que reemplaza el id de la referencia por el documento completo al que hace referencia, esto es como hacer un join en bases de datos relacionales.
* La ventaja es la modularidad, los datos estan en documentos separados, lo que facilita la reutilización. Es ideal para muchos datos.
* La desventaja es que es mas complejo de usar el populate() y puede requerir mas consultas(lo que puede afectar el rendimiento) para obtener los datos relacionados.
* La referencia es mas adecuada cuando los datos se reutilizan en distintos documentos, se actualizan de manera independiente o se consultan por separado muchas veces.


## Schemas y Modelos
### Producto
* Creo una carpeta llamada models y dentro de ella un archivo llamado Producto.js donde voy a definir el esquema y el modelo para los productos.
```js
const mongoose = require('mongoose');
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
  }
  }
});
```
* mongoose.Schema es metodo de mongose que es un constructor de esquemas, recibe un objeto con la estructura de la emtidad
* en el required o el min puedo pasar un booleano o un array, si es un array el primer elemento es el booleano y el segundo elemento es el mensaje de error que se va a mostrar si el campo no se cumple la validacion.
* trim es una propiedad que se utiliza para eliminar los espacios en blanco al inicio y al final de un string.

<br>

```js
const mongoose = require('mongoose');
const productoSchema = new mongoose.Schema({
  ....
  },{
    timestamps: true,
    strict: true
  }
});
```
* Al schema puedo pasarle un segundo objeto con opciones
  * timestamps es una opcion que se utiliza para agregar los campos createdAt y updatedAt que se crean automaticamente cada vez que se crea o se actualiza un documento
  * strict es una opcion que se utiliza para cambiar entre esquema rigido y esquema flexible
    * si strict es true (por defecto) solo se permiten los campos definidos en el esquema
    * si strict es false se permiten campos adicionales que no estan definidos en el esquema

<br>

* Ahora creamos el modelo a partir del esquema y lo exportamos para poder usarlo en otras partes de la aplicacion.
```js
const Producto = mongoose.model('Producto', productoSchema);
module.exports = Producto;
```
### Imagen (incrustacion)
* Como la imagen es una subentidad de producto, osea va ser un documento inscrustado dentro del documento producto, entonces no necesito crear un modelo para la imagen, simplemente defino el schema de la imagen como un objeto dentro del esquema del producto, quedando asi:
```js
const imagenSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria']
  },
  descripcion: {
    type: String,
    required: false, 
    trim: true
  }
});
```
#### Incrustacion para producto de imagen
* Para incrustar el esquema de la imagen dentro del esquema del producto, simplemente definimos un campo llamado imagen que es un array de objetos con el esquema de la imagen, quedando asi:
```js
const productoSchema = new mongoose.Schema({
  ...
  imagen: [imagenSchema]
},{
  timestamps: true,
  strict: true
});
```
* Si quiero poder inscrustrar varias imagenes dentro de un producto, entonces defino el campo imagen como un array 
* Si necesito reutilizar el esquema de la imagen en otras partes de la aplicacion, entonces puedo crear una carpeta schema y ahi definir el esquema de la imagen y exportarla para luego importarla en los modelos que necesitemos.

### Categoria (referencia) 1 A N
* Creamos un modelo para la categoria, ya que vamos a relacionarla con productos por referencia, quedando asi:
```js
const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: false, //opcional 
  }
},{  
  timestamps: true
});

const Categoria = mongoose.model('Categoria', categoriaSchema);
module.exports = Categoria;
```
#### Producto con referencia a categoria
* Ahora entonces que tenemos el modelo de categoria creado, podemos relacionarlo con el modelo de producto por referencia, para eso en el esquema del producto definimos el campo categoria como un ObjectId que hace referencia al modelo Categoria, quedando asi:
```js
const productoSchema = new mongoose.Schema({
 ......
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es obligatoria']
  },
  ......
});
```
* Asi se hace una relacion por referencia en Mongoose



### Etiqueta (referencia) N A N
* Creamos un modelo para la etiqueta, ya que vamos a relacionarla con productos por referencia
```js
const etiquetaSchema = new mongoose.Schema(
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
```
* Ahora para relacionar el modelo de etiqueta con el modelo de producto por referencia, definimos en el modelo producto el campo etiquetas como un array de ObjectId que hace referencia al modelo Etiqueta:
```js
  ....
   categoria: { // relacion 1 a N
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es obligatoria']
  },
  etiquetas: [{ // relacion N a N
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etiqueta'
  }],
  ....
```
* A diferencia de categoria, el campo etiquetas es un array de ObjectId porque un producto puede tener varias etiquetas (relacion N a N).
* Hay casos donde quiero guardar mas informacion sobre la relacion en vez de solo relacionarlo, en esos casos puedo crear un modelo de tabla intermedia ProductoEtiqueta que contenga como referencia los dos ids.


## Controladores
* Creo una carpeta llamada controllers y dentro de ella un archivo llamado productos.controller.js para manejar la logica de las operaciones CRUD (Create, Read, Update, Delete) para los productos.

### Obtener todos los productos
```js
const Producto = require('../models/Producto');

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find(); 
    res.status(200).json(productos); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" }); 
  }
};
```
* No cambia con lo que se hizo con Sequelize, la logica es la misma.
* Si queremos excluir campos al momento de hacer la consulta, por ejemplo si no queremos que nos traiga los campos createdAt y updatedAt, entonces podemos usar el método select() de Mongoose:
```js
const productos = await Producto.find()
  .select('-createdAt -updatedAt -__v')
```
### Obtener un producto por su ID
```js
const obtenerProductoPorId = async (req, res) => {
  try {
   const { id } = req.params; 
   const producto = await Producto.findById(id); 
   if (!producto) { 
     return res.status(404).json({ error: "Producto no encontrado" });
   }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" }); 
  }
};
```
***NOTA: Se sigue manteniendo la idea de dejar los controladores libres de ifs y crear middlewares pero en estos casos lo obviaremos para simplificar***
* Lo que cambia con respecto a Sequelize es que en lugar de usar el método findByPk() para obtener un producto por su ID, utilizamos el método findById() que es específico de Mongoose para obtener un documento por su ID.

### Crear un nuevo producto
```js
const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body); // Utilizamos el método create() del modelo Producto para crear un nuevo producto en la base de datos con los datos proporcionados en el cuerpo de la solicitud
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto", error: error.message });
  }
};
```
* Para crear un nuevo producto, utilizamos el método create() del modelo Producto, que recibe un objeto con los datos del nuevo producto (en este caso, req.body) y lo guarda en la base de datos. 

### Actualizar un producto existente
```js
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
```
* findByIdAndUpdate() es un método de Mongoose que se utiliza para actualizar un documento por su ID. Recibe el ID del documento a actualizar, un objeto con los campos a actualizar(el req.body) y como tercer parametro tenemos la posibilidad(podemos no ponerlo) de mandarle un objeto con opciones, por ejemplo { new: true } para que devuelva el documento actualizado en lugar del documento original. El runValidators: true es para que se ejecuten las validaciones definidas en el esquema del modelo.

### Eliminar un producto
```js 
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
```
* findByIdAndDelete() es un método de Mongoose que se utiliza para eliminar un documento por su ID. Recibe el ID del documento a eliminar y devuelve el documento eliminado si se encuentra, o null si no se encuentra.

### Agregar una imagen a un producto
```js
const agregarImagen = async (req, res) => {
    const { id } = req.params;
  .....
    producto.imagenes.push(req.body); // constante de producto que vive en memoria
    await producto.save();
  .....
};
```
* Al atributo imagenes del producto le hago un push(porque es un array) del req.body que es el objeto con la url y la descripcion de la imagen que el usuario va a pasar por el raw body al hacer el post.

### Eliminar una imagen de un producto
```js 
const eliminarImagen = async (req, res) => {
  try {    
    const { id, imagenId } = req.params;
    .....
    producto.imagenes = producto.imagenes.filter(imagen => imagen._id.toString() !== imagenId); // constante de producto que vive en memoria
    await producto.save();
    ...
};
```
* El filter se usa pasandole una funcion que devuelve V o F, si devuelve V entonces el elemento se queda en el array, pero si devuelve F entonces el elemento se elimina del array.
* Entonces si me quiero quedar con todas las imagenes excepto con la que quiero eliminar, le paso el id de la imagen que quiero eliminar y la comparo con el id de cada imagen del array, si el id de la imagen es diferente al id de la imagen que quiero eliminar, entonces se queda en el array, pero si el id de la imagen es igual al id de la imagen que quiero eliminar, entonces se elimina del array.
* Filter crea un nuevo array, no modifica el array original, por eso asigno el resultado del filter al atributo imagenes del producto para que se actualice el array de imagenes del producto.

### Agregar una etiqueta a un producto
* Para agregar una etiqueta a un producto recibimos por parametro el id del producto y el id de la etiqueta y los buscamos, si existen agregamos con un addToSet la etiqueta al array de etiquetas del producto y guardamos el producto
***NOTA: como vamos a trabajar con el modelo de etiquetas, necesitamos importarlo al principio del archivo***
```js 
const Producto = require('../models/Producto');
const Etiqueta = require('../models/Etiqueta');

const agregarEtiqueta = async (req, res) => {
 try{
  const { id, etiquetaId } = req.params; 
  const producto = await Producto.findById(id);
  ......
  const etiqueta = await Etiqueta.findById(etiquetaId); 
  .....
  producto.etiquetas.addToSet(etiquetaId); 
  await producto.save();
  ........
}
```
* El addToSet es un método de Mongoose que se utiliza para agregar un elemento a un array solo si ese elemento no existe en el array, es decir que no permite elementos duplicados en el array(no lo volveria a agregar).

### Eliminar una etiqueta de un producto
* Para eliminar una etiqueta de un producto recibimos por parametro el id del producto y el id de la etiqueta, buscamos el producto y la etiqueta, si existen eliminamos la etiqueta del array de etiquetas del producto con el método filter() y guardamos el producto.
```js
const eliminarEtiqueta = async (req, res) => {
  try {
    const { id, etiquetaId } = req.params;
    const producto = await Producto.findById(id);
   .....
    const etiqueta = await Etiqueta.findById(etiquetaId);
    .....
    producto.etiquetas = producto.etiquetas.filter(etiqueta => etiqueta.toString() !== etiquetaId);
    await producto.save();
    .......
};
```

### Populate
* El populate es un método de Mongoose que se utiliza para reemplazar el id de una referencia por el documento completo al que hace referencia, esto es como hacer un join en bases de datos relacionales.

* En el controlador de obtener un producto por su ID, utilizamos el método populate() para reemplazar el id de la categoria por el documento completo de la o algun atributo que queramos, quedando asi:
```js
const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find() 
      .populate('categoria', 'nombre'); 
    res.status(200).json(productos);
  .......
};
```
***NOTA: Sacar el ; al final de la línea de Producto.find()***
* Por defecto siempre igualmente va a traerme el id, si quiero que no me traiga el id de la categoria, entonces tengo que poner un guion antes del nombre del campo que quiero excluir:
```js
.populate('categoria', 'nombre -_id')
```
* Podemos agregar cuantos populate queramos si el producto tiene mas referencias, podemos usar tambien un solo populate y pasar un array de objetos donde cada objeto es un populate diferente.
* Si categoria tuviera una referencia a otra entidad, por ejemplo a un proveedor, entonces podríamos hacer un populate anidado para traer el nombre del proveedor dentro del populate de categoria.

* Para etiquetas hacemos lo mismo, simplemente agregamos otro populate para el campo etiquetas, quedando asi:
```js
  ....
  const productos = await Producto.find() 
    .populate('categoria', 'nombre -_id')
    .populate('etiquetas', 'nombre -_id')
    .select('-createdAt -updatedAt -__v'); 
  ......
};
```

### Categoria y Etiqueta
* Para categoria y etiqueta sigue la misma logica que para producto, simplemente cambiando el modelo y los campos correspondientes.


## Rutas
* Creo una carpeta llamada routes y dentro de ella un archivo llamado productos.routes.js para manejar las operaciones CRUD (Create, Read, Update, Delete) para los productos.

* Para definir endpoints para las imagenes lo hacemos dentro del mismo router de productos, quedando asi:
```js
router.post("/:id/imagenes", agregarImagen);
router.delete("/:id/imagenes/:imagenId", eliminarImagen);
```
* Para el post pasamos el id del producto al que queremos agregar la imagen y para el delete pasamos el id del producto y el id de la imagen que queremos eliminar.

* Para categorias hacemos lo mismo, creamos un router para categorias y definimos los endpoints para las operaciones CRUD de categoria.

* Para etiquetas hacemos lo mismo, creamos un router para etiquetas y definimos los endpoints para las operaciones CRUD de etiqueta.

* Para agregar o eliminar una etiqueta a un producto definimos un endpoint en el router de productos que reciba el id del producto y el id de la etiqueta
```js
router.post("/:id/etiquetas/:etiquetaId", agregarEtiqueta);
router.delete("/:id/etiquetas/:etiquetaId", eliminarEtiqueta);
```

## Postman - MongoDB
### Postman
* Para probar la API primero la corremos con el comando npm run dev para que se levante el servidor y luego abrimos Postman para hacer las solicitudes HTTP a la API.
#### Productos
##### GET
* Para obtener todos los productos hacemos una solicitud GET a http://localhost:3000/productos
##### POST
* Para crear un nuevo producto hacemos una solicitud POST a http://localhost:3000/productos en body raw con el siguiente cuerpo en formato JSON:
```json
{
    "nombre":"Mouse",
    "descripcion": "Mouse-con-USB",
    "precio":150,
    "stock": 20,
    "categoria": "Informática",
    "color": "Black"
}
```
##### PUT
* Para actualizar un producto existente hacemos una solicitud PUT a http://localhost:3000/productos/:id donde :id es el ID del producto que queremos actualizar, por ejemplo http://localhost:3000/productos/6a300bd9472e6326f3f8a295 y en el body raw con el siguiente cuerpo en formato JSON ponemos el producto modificado:
```json
{
    "nombre":"Mouse",
    "descripcion": "Mouse-con-USB",
    "precio":180,
    "stock": 5,
    "categoria": "Informática",
    "color": "Black"
}
```
##### DELETE
* Para eliminar un producto hacemos una solicitud DELETE a http://localhost:3000/productos/:id donde :id es el ID del producto que queremos eliminar, por ejemplo http://localhost:3000/productos/6a300bd9472e6326f3f8a295

#### Imagenes incrustradas en producto
##### POST
* Para agregar una imagen a un producto hacemos una solicitud POST a http://localhost:3000/productos/:id/imagenes donde :id es el ID del producto al que queremos agregar la imagen, por ejemplo http://localhost:3000/productos/6a300bd9472e6326f3f8a295/imagenes y en el body raw con el siguiente cuerpo en formato JSON ponemos la imagen que queremos agregar:
```json
{
    "url":"https://www.google.com.ar/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    "descripcion": "Logo de Google"
}
```
![alt text](imagenes/image7.png)
* Podemos tambien agrerar varias imagenes a un producto, y podemos hacerlo tambien al crear el producto, simplemente agregamos un array de imagenes en el body raw del post, quedando asi:
```json
{
    "nombre":"Mouse",
    "descripcion": "Mouse-con-USB",
    "precio":150,
    "stock": 20,
    "categoria": "Informática",
    "color": "Black",
    "imagenes":[
        {
            "url":"https://www.google.com.ar/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
            "descripcion": "Logo de Google"
        },
        {
            "url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Logo_2013_Google.png/800px-Logo_2013_Google.png",
            "descripcion": "Logo de Google 2"
        }
    ]
}
```
##### DELETE
* Para eliminar una imagen de un producto hacemos una solicitud DELETE a http://localhost:3000/productos/:id/imagenes/:imagenId donde :id es el ID del producto al que queremos eliminar la imagen y :imagenId es el ID de la imagen que queremos eliminar, por ejemplo http://localhost:3000/productos/6a300bd9472e6326f3f8a295/imagenes/6a300bd9472e6326f3f8a296
![alt text](imagenes/image10.png)

#### Categorias refenciadas en producto (1 a N)
##### POST
* Para crear una categoria hacemos una solicitud POST a http://localhost:3000/categorias en body raw con el siguiente cuerpo en formato JSON:
```json
{
    "nombre":"Informática",
    "descripcion": "Perifericos"
}
```
* Para crear un producto ahora tenemos que pasarle el ID de la categoria a la que queremos asociar el producto haciendo el POST a http://localhost:3000/productos por ejemplo:
```json
{
    "nombre": "Teclado Mecánico RGB",
    "descripcion": "Teclado mecánico con switches red y retroiluminación RGB",
    "precio": 8500,
    "stock": 20,
    "categoria": "6a31f697d46cb749e2cead72"
}  
```




#### Etiquetas refenciadas en producto (N a N)

##### POST
* Para crear una etiqueta hacemos una solicitud POST a http://localhost:3000/etiquetas en body raw con el siguiente cuerpo en formato JSON:
```json
{
    "nombre":"Nuevo"
}
```
* Para crear un producto ahora tenemos que pasarle un array con los ID de las etiquetas a las que queremos asociar el producto haciendo el POST a http://localhost:3000/productos por ejemplo:
```json
{
    "nombre": "Teclado Mecánico RGB",
    "descripcion": "Teclado mecánico con switches red y retroiluminación RGB",
    "precio": 8500,
    "stock": 20,
    "categoria": "6a31f697d46cb749e2cead72",
    "etiquetas": ["6a3201c8d46cb749e2cead73", "6a3201c8d46cb749e2cead74"]
}  
```
#### POST - Agregar una etiqueta a un producto
* Para agregar una etiqueta a un producto hacemos una solicitud POST a http://localhost:3000/productos/:id/etiquetas/:etiquetaId donde :id es el ID del producto al que queremos agregar la etiqueta y :etiquetaId es el ID de la etiqueta que queremos agregar, por ejemplo http://localhost:3000/productos/6a329d4c6317b301674b1f76/etiquetas/6a329aad6317b301674b1f6d
![alt text](imagenes/image14.png)
![alt text](imagenes/image15.png)
![alt text](imagenes/image16.png)

### MongoDBexpress
* Para ver la bdd en mongo-express entramos a http://localhost:8081/ (8081 es el puerto que definimos en el docker-compose.yml para mongo-express) y nos conectamos a la base de datos tienda

![alt text](imagenes/image.png)

* Y vemos todas las rutas que tenemos importadas en app.js, en este caso tenemos la colecciones productos donde se guardan los productos que creamos desde la API.

![alt text](imagenes/image2.png)

* Si entramos vemos que ahora la bdd no es una tabla sino que es una colección de documentos JSON, cada documento representa un producto y tiene los campos que definimos en el esquema del modelo Producto.

![alt text](imagenes/image3.png)
![alt text](imagenes/image4.png)

* El id en MongoDB es un campo llamado _id que es un ObjectId, es aleatorio(no tanto porque lo crea usando fecha de creacion y otras cosas) y es una forma de hacerlo unico para que no se repita en diferentes servidores

* Si hacemos un delete de un producto desde la Postman, el producto se elimina de la colección productos en mongoDB y ya no lo vemos en mongo-express ni en la API.

![alt text](imagenes/image6.png)
![alt text](imagenes/image5.png)


* Si hacemos un post de una imagen a un producto desde la Postman, la imagen se agrega al array de imagenes del producto en mongoDB y ya la vemos en mongo-express y en la API.

![alt text](imagenes/image7.png)
![alt text](imagenes/image8.png)


* Si hacemos un delete de una imagen de un producto desde la Postman, la imagen se elimina del array de imagenes del producto en mongoDB y ya no la vemos en mongo-express ni en la API.

![alt text](imagenes/image9.png)
![alt text](imagenes/image10.png)
![alt text](imagenes/image11.png)

* Si hacemos un post de un producto con una categoria y etiqueta referenciada, el producto se guarda en mongoDB con el id de la categoria y de las etiquetas y lo vemos en mongo-express y en la API.

![alt text](imagenes/image12.png)
![alt text](imagenes/image13.png)

## Redis
* Redis es una base de datos en memoria, es decir que los datos se almacenan en la memoria RAM del servidor, lo que permite un acceso muy rápido a los datos (operaciones de lectura y escritura muy rápidas).
* Tiene estructura clave-valor, es decir que los datos se almacenan en pares de clave y valor, donde la clave es un string y el valor puede ser un string, un número, un array, un objeto, etc.
  * GET() para obtener el valor de una clave -> por ejemplo GET("productos") para obtener el valor de la clave "productos"
  * SET() para establecer el valor de una clave -> por ejemplo SET("productos", JSON.stringify(productos)) para establecer el valor de la clave "productos" con el valor de productos.
  ***NOTA: Como no se puede guardar un array de objetos en Redis, lo convertimos a un JSON con JSON.stringify()***

* Una desventaja es si los datos estan en RAM y no esta configurado para persistir los datos en disco si el servidor se cae o se reinicia, se pierden todos los datos almacenados en Redis, por eso es importante configurar Redis para que persista los datos en disco.

* Redis no reemplaza a MongoDB, sino que es un complemento

* Primero instalo la libreria de Redis
```bash
npm install redis
```
* Tenemos que agregar a docker-compose.yml la configuracion para levantar un contenedor de Redis
```yml
  redis:
    image: redis:8-alpine
    ports:
      - 6379:6379
    volumes:
      - redis-data:/data
    command: redis-server --save 60 1 --loglevel warning
    
volumes:
  mongo-data:
  redis-data:
```
* En el archivo .env agregamos la variable de entorno para la URL de Redis para conectarnos a la base de datos

```
REDIS_URI=redis://localhost:6379
```

* Y luego hacemos un docker-compose up -d para levantar el contenedor de Redis

* Ahora creamos la conexion con la base de datos Redis, para eso creamos un archivo llamado redis.js dentro de la carpeta config donde vamos a configurar la conexion a Redis.

```js
const {createClient} = require("redis");

const redisClient = createClient({
 url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => {
 console.error("Error en Redis:", err);
});

const connectRedis = async () => {
 try {
  await redisClient.connect();
  console.log("Conectado a Redis");
 } catch (error) {
  console.error("Error al conectar a Redis:", error);
 }
};

module.exports = { redisClient, connectRedis };
```
* Primero importamos createClient que es una función que nos permite crear un cliente de Redis para conectarnos a la base de datos Redis.
* Despues creamos el cliente
* Manejamos el evento de error para mostrar cualquier error que ocurra en la conexion a Redis
* Si no hubo error creamos la funcion de connectRedis que utiliza el método connect() del cliente de Redis para conectarnos a la base de datos Redis
* Exportamos la funcion y el cliente

* Luego en app.js importamos la funcion de connectRedis y la ejecutamos para conectarnos a Redis cuando se levante el servidor
```js
const { connectRedis } = require('./config/redis'); 
connectRedis(); 
```

## Utilizar Redis
* Primer paso es importamos el cliente de Redis en el controlador donde queremos utilizarlo, por ejemplo en el controlador de productos:
```js
const { redisClient } = require('../config/redis');
```
### Guardar en cache varios productos
* Luego para obtener los productos, primero intentamos obtenerlos desde Redis utilizando el método get() del cliente de Redis, si los productos existen en Redis(la cache), los parseamos y los devolvemos como respuesta, pero si no existen en Redis, entonces obtenemos los productos desde MongoDB y los devolvemos como respuesta.
```js
const obtenerProductos = async (req, res) => {
  try {
    //Base de datos de Redis
    const productosEnCache = await redisClient.get("productos"); 
    if (productosEnCache) {
      console.log("Productos obtenidos desde Redis");
      return res.status(200).json({
        origen: "redis",
        productos: JSON.parse(productosEnCache)
      });
    }
    //Base de datos de MongoDB
    const productos = await Producto.find() 
      .populate('categoria', 'nombre -_id') 
      .populate('etiquetas', 'nombre -_id')
      .select('-createdAt -updatedAt -__v');
    await redisClient.set("productos", JSON.stringify(productos))
    res.status(200).json(productos); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos", error: error.message });
  }
};
```
* En este ejemplo, primero intentamos obtener los productos desde Redis pero si no existen en Redis entonces obtenemos usamos MongoDB y guardamos los guardamos los productos en Redis para que la proxima vez se obtengan mas rapidamente al buscarlos en la Redis cache.
* Si queremos podemos pasar un tercer argumento a set() para establecer un tiempo de expiracion de la clave, por ejemplo si queremos que los productos se eliminen de Redis despues de 5 minutos
```js
await redisClient.set("productos", JSON.stringify(productos), {EX: 300})
```

* Ahora tenemos que eliminar la clave "productos" de la base de datos de Redis cada vez que se cree, actualice o elimine un producto (o cualquier otra operacion que modifique la bdd) para que la cache se mantenga actualizada, para eso utilizamos el método del cliente de Redis del()
```js
const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body); 
    await redisClient.del("productos");
    res.status(201).json(nuevoProducto);
    .....
```
* Lo mejor es colocarlo antes de mandar la respuesta

### Guardar en cache un producto por su ID
* Primero tenemos que crear la clave que vamos a utilizar para guardar el producto en Redis, para eso podemos usar el id del producto como parte de la clave, por ejemplo "producto:ID", donde ID es el id del producto que el usuario va a pasar por parametro y despues intentamos obtener el producto desde Redis utilizando el método get()
```js
const obtenerProductoPorId = async (req, res) => {
  try {
   const { id } = req.params; 
   const claveCache = `producto:${id}`; // Creamos la clave
   const productoEnCache = await redisClient.get(claveCache); // Intentamos obtener el producto desde Redis 
    if (productoEnCache) {
      console.log("Producto obtenido desde Redis");
      return res.status(200).json({
        origen: "redis",
        producto: JSON.parse(productoEnCache)
      });
    }
```
* despues repetimos la logica de obtener el producto desde MongoDB y guardarlo en Redis, pero ahora utilizamos la clave que creamos para guardar el producto en Redis
```js
console.log("Producto obtenido desde MongoDB");
   await redisClient.set(claveCache, JSON.stringify(producto), { EX: 60 });
    res.status(200).json(producto);
```
* Y al igual que antes, cada vez que se cree, actualice o elimine un producto, tenemos que eliminar la clave del producto de Redis para que la cache se mantenga actualizada, para eso utilizamos el método del() del cliente de Redis
```js
  await redisClient.del("productos");
  const claveCache = `producto:${id}`; 
  await redisClient.del(claveCache); 
```
### Postman
* Entonces nuestra primer consulta va a entrar por la base de datos de MongoDB

![alt text](imagenes/image17.png)
* En la segunda consulta ya se obtiene el producto desde Redis, lo que hace que la consulta sea mucho mas rapida

![alt text](imagenes/image18.png)

### Docker
* Si queremos ver la base de datos Redis podemos verlo desde docker ejecutando el cliente de Redis en modo interactivo con el comando docker compose exec "nombre del contenedor de Redis" redis-cli
```bash
docker compose exec redis redis-cli
```
* Vamos a ver esto:
```bash
PS D:\Users\angie\UNAHUR\ESTRATEGIAS DE PERSISTENCIA\Practica MongoDB\api-productos> docker compose exec redis redis-cli
127.0.0.1:6379> PING
PONG
127.0.0.1:6379> 
```
* Para ver todas las claves que tenemos en Redis utilizamos el comando keys *
```bash
127.0.0.1:6379> keys *
1) "productos"
```
* Si quiero obtener los datos de producto usamos el GET
```bash
127.0.0.1:6379> GET  productos
"[{\"_id\":\"6a329c926317b301674b1f72\",\"nombre\":\"Teclado Mec\xc3\xa1nico RGB\",\"descripcion\":\"Teclado mec\xc3\xa1nico con switches red y retroiluminaci\xc3\xb3n RGB\",\"precio\":8500,\"stock\":20,\"categoria\":{\"nombre\":\"informatica\"},\"etiquetas\":[{\"nombre\":\"Oferta\"},{\"nombre\":\"Nuevo\"}],\"imagenes\":[]},{\"_id\":\"6a329d326317b301674b1f73\",\"nombre\":\"Monitor 24 pulgadas Full HD\",\"descripcion\":\"Monitor LED Full HD 1080p con panel IPS y 75Hz\",\"precio\":42000,\"stock\":10,\"categoria\":{\"nombre\":\"electronica\"},\"etiquetas\":[{\"nombre\":\"Destacado\"},{\"nombre\":\"Nuevo\"}],\"imagenes\":[]},{\"_id\":\"6a329d436317b301674b1f74\",\"nombre\":\"Mouse Inal\xc3\xa1mbrico\",\"descripcion\":\"Mouse \xc3\xb3ptico inal\xc3\xa1mbrico con bater\xc3\xada recargable\",\"precio\":3200,\"stock\":45,\"categoria\":{\"nombre\":\"informatica\"},\"etiquetas\":[{\"nombre\":\"Oferta\"},{\"nombre\":\"Destacado\"}],\"imagenes\":[]},{\"_id\":\"6a329d496317b301674b1f75\",\"nombre\":\"Silla Gamer\",\"descripcion\":\"Silla ergon\xc3\xb3mica con soporte lumbar y apoyabrazos ajustables\",\"precio\":65000,\"stock\":8,\"categoria\":{\"nombre\":\"electronica\"},\"etiquetas\":[{\"nombre\":\"Destacado\"}],\"imagenes\":[]},{\"_id\":\"6a329d4c6317b301674b1f76\",\"nombre\":\"Disco SSD 1TB\",\"descripcion\":\"Disco s\xc3\xb3lido SATA III con velocidad de lectura de 550MB/s\",\"precio\":28000,\"stock\":30,\"categoria\":{\"nombre\":\"electronica\"},\"etiquetas\":[{\"nombre\":\"Nuevo\"},{\"nombre\":\"Oferta\"}],\"imagenes\":[]}]"
```