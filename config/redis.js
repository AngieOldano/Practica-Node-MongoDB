const {createClient} = require("redis"); // importamos la función createClient de la librería redis para crear un cliente de Redis

const redisClient = createClient({ // creamos el cliente
 url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => { // manejamos el evento de error para mostrar cualquier error que ocurra en Redis
 console.error("Error en Redis:", err);
});

const connectRedis = async () => {
 try {
  await redisClient.connect(); // nos conectamos a Redis
  console.log("Conectado a Redis");
 } catch (error) {
  console.error("Error al conectar a Redis:", error);
 }
};

module.exports = { redisClient, connectRedis };