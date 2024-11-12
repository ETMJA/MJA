const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

// Variables para almacenar los datos
let tempData = JSON.parse(localStorage.getItem('tempData')) || [];
let humData = JSON.parse(localStorage.getItem('humData')) || [];
let timeLabels = JSON.parse(localStorage.getItem('timeLabels')) || [];

// Conexión al broker MQTT
client.on("connect", () => {
  console.log("Conectado al broker MQTT");
  client.subscribe("/MJA/DHT11", (err) => {
    if (!err) {
      console.log("Suscripción exitosa a /MJA/DHT11");
    } else {
      console.error("Error al suscribirse:", err);
    }
  });
});

// Procesar los mensajes MQTT
client.on("message", (topic, message) => {
  console.log("Mensaje recibido en topic " + topic + ": " + message.toString());

  if (topic === "/MJA/DHT11") {
    const [temp, hum] = message.toString().split(",");
    if (temp && hum) {
      // Mostrar los valores de temperatura y humedad en el HTML
      document.getElementById("temp").innerText = temp + " °C";
      document.getElementById("hum").innerText = hum + " %";

      // Guardar los nuevos datos en localStorage
      tempData.push(parseFloat(temp));
      humData.push(parseFloat(hum));

      // Verificar si han pasado 24 horas desde el primer dato
      const currentTime = Date.now(); // Hora actual en milisegundos
      const firstTimestamp = timeLabels[0] * 1000; // Convertir tiempo en segundos a milisegundos
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      if (currentTime - firstTimestamp > twentyFourHours) {
        // Eliminar los datos más antiguos
        tempData.shift();
        humData.shift();
        timeLabels.shift();
      }

      // Guardar los datos en localStorage
      localStorage.setItem('tempData', JSON.stringify(tempData));
      localStorage.setItem('humData', JSON.stringify(humData));
      localStorage.setItem('timeLabels', JSON.stringify(timeLabels));
    } else {
      console.warn("Formato inesperado de datos:", message.toString());
    }
  }
});

client.on("error", (error) => {
  console.error("Error de conexión MQTT:", error);
});

client.on("offline", () => {
  console.warn("Cliente MQTT está offline");
});
