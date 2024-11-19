const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

// Variables para almacenar los datos
let tempData = JSON.parse(localStorage.getItem("tempData")) || [];
let humData = JSON.parse(localStorage.getItem("humData")) || [];
let timeLabels = JSON.parse(localStorage.getItem("timeLabels")) || [];

// Configuración de los gráficos
const ctxTemp = document.getElementById("tempChart").getContext("2d");
const tempChart = new Chart(ctxTemp, {
  type: "line",
  data: {
    labels: timeLabels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: tempData,
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
        pointRadius: 0, // Eliminar los puntos
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: { display: true, text: "Tiempo (segundos)" },
      },
      y: {
        title: { display: true, text: "Temperatura (°C)" },
      },
    },
    responsive: true,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x", // Desplazamiento en eje X
          speed: 10,
        },
        zoom: { enabled: false }, // Desactivar zoom
      },
    },
  },
});

const ctxHum = document.getElementById("humChart").getContext("2d");
const humChart = new Chart(ctxHum, {
  type: "line",
  data: {
    labels: timeLabels,
    datasets: [
      {
        label: "Humedad (%)",
        data: humData,
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
        pointRadius: 0, // Eliminar los puntos
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: { display: true, text: "Tiempo (segundos)" },
      },
      y: {
        title: { display: true, text: "Humedad (%)" },
      },
    },
    responsive: true,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x", // Desplazamiento en eje X
          speed: 10,
        },
        zoom: { enabled: false }, // Desactivar zoom
      },
    },
  },
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

client.on("message", (topic, message) => {
  if (topic === "/MJA/DHT11") {
    const data = message.toString().split(",");
    if (data.length === 2) {
      const temp = parseFloat(data[0]);
      const hum = parseFloat(data[1]);
      if (!isNaN(temp) && !isNaN(hum)) {
        document.getElementById("temp").innerText = `${temp} °C`;
        document.getElementById("hum").innerText = `${hum} %`;

        // Añadir nuevos datos
        const newTime = timeLabels.length ? timeLabels[timeLabels.length - 1] + 1 : 0;
        timeLabels.push(newTime);
        tempData.push(temp);
        humData.push(hum);

        // Eliminar datos antiguos si han pasado 24 horas
        const maxTime = 24 * 60 * 60; // 24 horas en segundos
        if (timeLabels.length > 0 && newTime - timeLabels[0] > maxTime) {
          tempData.shift();
          humData.shift();
          timeLabels.shift();
        }

        // Actualizar gráficos
        tempChart.update();
        humChart.update();

        // Guardar datos en localStorage
        localStorage.setItem("tempData", JSON.stringify(tempData));
        localStorage.setItem("humData", JSON.stringify(humData));
        localStorage.setItem("timeLabels", JSON.stringify(timeLabels));
      } else {
        console.warn("Datos no válidos recibidos:", message.toString());
      }
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
