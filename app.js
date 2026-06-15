const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Importamos la función para conectarnos a la base de datos
connectDB(); // Llamamos a la función para conectarnos a la base de datos

dotenv.config();
const app = express();

app.get('/productos', (req, res) => {
 res.send('API de productos');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Servidor escuchando en el puerto ${PORT}`);
});