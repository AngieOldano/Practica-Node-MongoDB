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
* Instalo mongoose dotenv y express con el comando: npm install mongoose dotenv express
  * dotenv me permite cargar variables de entorno desde un archivo .env
  * express es un framework para crear aplicaciones web en node.js
* Creo la conexion usando mongoose para conectarnos con MongoDB
* Crear los schemas y modelos

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

* Ahora creamos el modelo a partir del esquema y lo exportamos para poder usarlo en otras partes de la aplicacion.
```js
const Producto = mongoose.model('Producto', productoSchema);
module.exports = Producto;
```

# Practica-Node-MongoDB
