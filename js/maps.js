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
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      }
    ]
  });

  mapaJaCarregado = true;

  carregarOcorrenciasSalvas();
  console.log('✅ Mapa inicializado com sucesso');
}

window.initMap = initMap;

// Reinicializa o mapa quando a página fica visível (volta para a aba)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && mapaJaCarregado && map) {
    console.log('Página voltou a ficar visível');
    // Força redimensionamento do mapa
    google.maps.event.trigger(map, 'resize');
    carregarOcorrenciasSalvas();
  }
});

// Tenta inicializar se o Google Maps já carregou
document.addEventListener('DOMContentLoaded', () => {
  if (window.google && window.google.maps) {
    initMap();
  }
});

function adicionarMarcador(posicao, titulo, categoria) {
  const opcoesMarcador = {
    position: posicao,
    map: map,
    title: titulo
  };

  const icone = obterIconeDaCategoria(categoria);
  if (icone) {
    opcoesMarcador.icon = {
      url: icone,
      scaledSize: new google.maps.Size(32, 32)
    };
  }

  const marker = new google.maps.Marker(opcoesMarcador);

  markers.push(marker);

  const infoWindow = new google.maps.InfoWindow({
    content: `<strong>${titulo}</strong>`,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}

function carregarOcorrenciasSalvas() {
  let ocorrencias = [];

  markers.forEach(marker => marker.setMap(null));
  markers = [];

  try {
    ocorrencias = JSON.parse(localStorage.getItem('mocal_ocorrencias')) || [];
  } catch (erro) {
    console.warn('Não foi possível carregar as ocorrências salvas:', erro);
  }

  ocorrencias.forEach(ocorrencia => {
    const latitude = Number(ocorrencia.latitude);
    const longitude = Number(ocorrencia.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const titulo = formatarCategoria(ocorrencia.categoria);
    const descricao = ocorrencia.descricao ? `: ${ocorrencia.descricao}` : '';

    adicionarMarcador(
      { lat: latitude, lng: longitude },
      `${titulo}${descricao}`,
      ocorrencia.categoria
    );
  });
}

function obterIconeDaCategoria(categoria) {
  const icones = {
    'falta-de-agua': 'img/icone-falta-agua.png',
    'vazamento-de-agua': 'img/icone-vazamento.png',
    'esgoto-a-ceu-aberto': 'img/icone-esgoto.png',
    'lixo-acumulado': 'img/icone-lixo.png',
    'outros-problemas': 'img/icone-outros.png'
  };

  return icones[categoria] || 'img/icone-outros.png';
}

function formatarCategoria(categoria) {
  return String(categoria || 'Ocorrência')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, letra => letra.toUpperCase());
}