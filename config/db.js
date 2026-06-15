const monogoose = require('mongoose'); // Importamos mongoose para conectarnos a la base de datos

const connectDB = async () => { // Creamos una función asíncrona para conectarnos a la base de datos
 try {
  await monogoose.connect(process.env.MONGO_URI);// Nos conectamos a la base de datos utilizando la URL de conexión que hemos definido en el archivo .env
  console.log('Conectado a MongoDB'); 
 } catch (error) {
  console.error('Error al conectar a MongoDB:', error.module);
 } 
};
module.exports = connectDB; 