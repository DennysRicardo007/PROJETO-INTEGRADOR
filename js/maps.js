let map;
let markers = [];
let mapaJaCarregado = false;

function initMap() {
  console.log('Inicializando mapa...');
  
  const recife = { lat: -8.0476, lng: -34.8770 };
  
  // Se o mapa já foi criado, limpa os marcadores antigos
  if (map) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: recife,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false
  });

  mapaJaCarregado = true;

  adicionarMarcador(recife, "Ocorrência de água em Recife");
  console.log('✅ Mapa inicializado com sucesso');
}

window.initMap = initMap;

// Reinicializa o mapa quando a página fica visível (volta para a aba)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && mapaJaCarregado && map) {
    console.log('Página voltou a ficar visível');
    // Força redimensionamento do mapa
    google.maps.event.trigger(map, 'resize');
  }
});

// Tenta inicializar se o Google Maps já carregou
document.addEventListener('DOMContentLoaded', () => {
  if (window.google && window.google.maps) {
    initMap();
  }
});

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