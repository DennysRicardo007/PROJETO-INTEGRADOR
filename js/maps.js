let map;
let markers = [];
let mapaJaCarregado = false;

function initMap() {
  const recife = { lat: -8.0476, lng: -34.8770 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: recife,
  });

  mapaJaCarregado = true;

  adicionarMarcador(recife, "Ocorrência de água em Recife");
}

window.initMap = initMap;

function adicionarMarcador(posicao, titulo) {
  const marker = new google.maps.Marker({
    position: posicao,
    map: map,
    title: titulo,
    icon: {
      url: "img/icone-emoji.png",
      scaledSize: new google.maps.Size(32, 32),
    },
  });

  markers.push(marker);

  const infoWindow = new google.maps.InfoWindow({
    content: `<strong>${titulo}</strong>`,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}