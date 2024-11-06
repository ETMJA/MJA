function updateData() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/data', true);
  xhr.onload = function () {
    if (this.status == 200) {
      var data = JSON.parse(this.responseText);
      document.getElementById('tempChart').innerText = data.temperature + ' °C';
      document.getElementById('humChart ').innerText = data.humidity + ' %';
    }
  };
  xhr.send();
}

function updateTime() {
  var now = new Date();
  var hours = String(now.getHours()).padStart(2, '0');
  var minutes = String(now.getMinutes()).padStart(2, '0');
  var seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').innerText = hours + ':' + minutes + ':' + seconds;
}

setInterval(updateData, 1000); // Actualizar los datos cada 1 segundo
setInterval(updateTime, 1000); // Actualizar la hora cada 1 segundo

window.onload = function() {
  updateData();
  updateTime();
};
