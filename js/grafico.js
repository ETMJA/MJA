const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

// Variables para almacenar los datos
let tempData = JSON.parse(localStorage.getItem('tempData')) || [];
let humData = JSON.parse(localStorage.getItem('humData')) || [];
let timeLabels = JSON.parse(localStorage.getItem('timeLabels')) || [];

// Configuración de los gráficos
const ctxTemp = document.getElementById('tempChart').getContext('2d');
const tempChart = new Chart(ctxTemp, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Temperatura (°C)',
      data: tempData,
      borderColor: 'rgba(255, 99, 132, 1)',
      fill: false,
      pointRadius: 0  // Eliminar los puntos
    }]
  },
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Tiempo (segundos)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)'
        }
      }
    },
    responsive: true,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x', // Permitir el desplazamiento solo en el eje X
          speed: 10, // Velocidad de desplazamiento
        },
        zoom: {
          enabled: false, // Desactivar el zoom
        }
      }
    }
  }
});

const ctxHum = document.getElementById('humChart').getContext('2d');
const humChart = new Chart(ctxHum, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Humedad (%)',
      data: humData,
      borderColor: 'rgba(54, 162, 235, 1)',
      fill: false,
      pointRadius: 0  // Eliminar los puntos
    }]
  },
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Tiempo (segundos)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Humedad (%)'
        }
      }
    },
    responsive: true,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x', // Permitir el desplazamiento solo en el eje X
          speed: 10, // Velocidad de desplazamiento
        },
        zoom: {
          enabled: false, // Desactivar el zoom
        }
      }
    }
  }
});

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
      document.getElementById("temp").innerText = temp + " °C";
      document.getElementById("hum").innerText = hum + " %";

      // Añadir los nuevos datos al gráfico
      const currentTime = Date.now(); // Hora actual en milisegundos
      const newTime = timeLabels.length ? timeLabels[timeLabels.length - 1] + 1 : 0; // Incrementar el tiempo
      timeLabels.push(newTime);
      tempData.push(parseFloat(temp));
      humData.push(parseFloat(hum));

      // Verificar si han pasado 24 horas desde el primer dato
      const firstTimestamp = timeLabels[0] * 1000; // Convertir tiempo en segundos a milisegundos
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      if (currentTime - firstTimestamp > twentyFourHours) {
        // Eliminar los datos más antiguos
        tempData.shift();
        humData.shift();
        timeLabels.shift();
      }

      // Actualizar ambos gráficos
      tempChart.update();
      humChart.update();

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
