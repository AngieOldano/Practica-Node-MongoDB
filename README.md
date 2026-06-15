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
const monogoose = require('mongoose'); 

const connectDB = async () => { // Creamos una función asíncrona para conectarnos a la base de datos
 try {
  await monogoose.connect(process.env.MONGO_URI);// Nos conectamos a la base de datos utilizando la URL de conexión que hemos definido en el archivo .env
  console.log('Conectado a MongoDB'); 
 } catch (error) {
  console.error('Error al conectar a MongoDB:', error.module);
 } 
};
```
* monogoose.connect es un metodo connect que recibe la URL de conexion a mongoDB, se la puedo pasar atras de una variable de entorno (el .env)
* En el .env defino la variable de entorno MONGO_URI con la URL de conexion a mongoDB, esta URL tiene la siguiente estructura: mongodb://usuario:contraseña@host:puerto/nombre-base-de-datos?authSource=admin
***IMPORTANTE: Las variables de entorno se utilizan para no exponer información sensible en el código fuente***
```
// .env
PORT=3000
MONGO_URI=mongodb://admin:admin1234@localhost:27017/tienda?authSource=admin
```

## Schemas y Modelos
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

## Rutas
* Creo una carpeta llamada routes y dentro de ella un archivo llamado productos.routes.js para manejar las operaciones CRUD (Create, Read, Update, Delete) para los productos.
***NOTA: Esta parte es distinta igual a lo que se hizo con Sequelize***


## Postman - MongoDB
### Postman
* Para probar la API primero la corremos con el comando npm run dev para que se levante el servidor y luego abrimos Postman para hacer las solicitudes HTTP a la API.
* Para obtener todos los productos hacemos una solicitud GET a http://localhost:3000/api/productos
* Para crear un nuevo producto hacemos una solicitud POST a http://localhost:3000/api/productos en body raw con el siguiente cuerpo en formato JSON:
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
* Para actualizar un producto existente hacemos una solicitud PUT a http://localhost:3000/api/productos/:id donde :id es el ID del producto que queremos actualizar, por ejemplo http://localhost:3000/productos/6a300bd9472e6326f3f8a295 y en el body raw con el siguiente cuerpo en formato JSON ponemos el producto modificado:
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
* Para eliminar un producto hacemos una solicitud DELETE a http://localhost:3000/api/productos/:id donde :id es el ID del producto que queremos eliminar, por ejemplo http://localhost:3000/productos/6a300bd9472e6326f3f8a295

### MongoDB
* Para ver la bdd en mongo-express entramos a http://localhost:8081/ (8081 es el puerto que definimos en el docker-compose.yml para mongo-express) y nos conectamos a la base de datos tienda

![alt text](imagenes/image.png)

* Y vemos todas las colecciones que tenemos, en este caso tenemos la colecciones productos donde se guardan los productos que creamos desde la API.

![alt text](imagenes/image2.png)

* Si la veo vemos que ahora la bdd no es una tabla sino que es una colección de documentos JSON, cada documento representa un producto y tiene los campos que definimos en el esquema del modelo Producto.
![alt text](imagenes/image3.png)
![alt text](imagenes/image4.png)

* El id en MongoDB es un campo llamado _id que es un ObjectId, es aleatorio(no tanto porque lo crea usando fecha de creacion y otras cosas) y es una forma de hacerlo unico para que no se repita en diferentes servidores

* Si hacemos un delete de un producto desde la Postman, el producto se elimina de la colección productos en mongoDB y ya no lo vemos en mongo-express ni en la API.
![alt text](imagenes/image6.png)
![alt text](imagenes/image5.png)