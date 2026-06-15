const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db'); // Importamos la función para conectarnos a la base de datos
const productosRouter = require('./routes/productos.routes'); // Importamos las rutas de productos
const app = express();

connectDB(); // Llamamos a la función para conectarnos a la base de datos
app.use(express.json());

app.get('/', (req, res) => {
res.send('API de productos');
});

app.use("/productos", productosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Servidor escuchando en el puerto ${PORT}`);
});


