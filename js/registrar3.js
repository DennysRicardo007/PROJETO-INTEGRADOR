(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. INTERFACE
     ------------------------------------------------------------------------ */

  // Coordenada inicial de demonstração (Recife - Alto Santa Terezinha)
  const COORD_INICIAL = { lat: -8.0339, lng: -34.9198 };

  const elMapa = document.getElementById('map');
  const elBtnLocalizacao = document.getElementById('btnMinhaLocalizacao');
  const elCoordsInfo = document.getElementById('coordsInfo');
  const elEndereco1 = document.getElementById('enderecoLinha1');
  const elEndereco2 = document.getElementById('enderecoLinha2');
  const elEndereco3 = document.getElementById('enderecoLinha3');

  // Evita que uma busca de endereço antiga "atrase" e sobrescreva
  // o resultado de um clique mais recente do usuário.
  let idBuscaEndereco = 0;

  const elDescricao = document.getElementById('descricao');
  const elContador = document.getElementById('contadorChars');

  const elBtnAddFoto = document.getElementById('btnAddFoto');
  const elBtnAddVideo = document.getElementById('btnAddVideo');
  const elInputFoto = document.getElementById('inputFoto');
  const elInputVideo = document.getElementById('inputVideo');
  const elPreviewGrid = document.getElementById('previewGrid');
  const elPreviewVazio = document.getElementById('previewVazio');

  const elBtnRegistrar = document.getElementById('btnRegistrar');
  const elBtnVoltar = document.getElementById('btnVoltar');

  const elModal = document.getElementById('modalSucesso');
  const elModalProtocolo = document.getElementById('modalProtocolo');
  const elBtnFecharModal = document.getElementById('btnFecharModal');

  let mapa;
  let marcador;

  function iniciarMapa() {
    mapa = L.map(elMapa, {
      zoomControl: false,
      attributionControl: false,
    }).setView([COORD_INICIAL.lat, COORD_INICIAL.lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapa);

    L.control.zoom({ position: 'bottomright' }).addTo(mapa);

    marcador = L.marker([COORD_INICIAL.lat, COORD_INICIAL.lng], {
      draggable: true,
    }).addTo(mapa);

    ocorrencia.latitude = COORD_INICIAL.lat;
    ocorrencia.longitude = COORD_INICIAL.lng;

    buscarEnderecoPorCoordenadas(COORD_INICIAL.lat, COORD_INICIAL.lng);

    mapa.on('click', (evento) => {
      moverMarcador(evento.latlng.lat, evento.latlng.lng);
    });

    marcador.on('dragend', () => {
      const posicao = marcador.getLatLng();
      moverMarcador(posicao.lat, posicao.lng, false);
    });

    // Garante que o mapa recalcule o tamanho após o layout ser aplicado.
    setTimeout(() => mapa.invalidateSize(), 150);

    // Recalcula o tamanho do mapa ao redimensionar a janela (ex.: girar o
    // celular ou alternar entre o layout mobile e o layout desktop).
    let idResizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(idResizeTimeout);
      idResizeTimeout = setTimeout(() => mapa.invalidateSize(), 200);
    });
  }

  function moverMarcador(lat, lng, centralizar = true) {
    marcador.setLatLng([lat, lng]);
    if (centralizar) {
      mapa.panTo([lat, lng]);
    }

    ocorrencia.latitude = lat;
    ocorrencia.longitude = lng;

    elCoordsInfo.textContent = `Lat: ${lat.toFixed(5)} · Lng: ${lng.toFixed(5)}`;

    buscarEnderecoPorCoordenadas(lat, lng);
  }

  /**
   * Geocodificação reversa: converte lat/lng em um endereço legível,
   * usando o serviço público do Nominatim (OpenStreetMap) — o mesmo
   * provedor dos tiles do mapa, sem necessidade de chave de API.
   */
  function buscarEnderecoPorCoordenadas(lat, lng) {
    const idDestaBusca = ++idBuscaEndereco;

    elEndereco1.textContent = 'Buscando endereço...';
    elEndereco2.textContent = '';
    elEndereco3.textContent = '';

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`;

    fetch(url, { headers: { Accept: 'application/json' } })
      .then((resposta) => {
        if (!resposta.ok) throw new Error('Falha na resposta do serviço de endereço.');
        return resposta.json();
      })
      .then((dados) => {
        // Se o usuário já clicou em outro ponto enquanto esta busca
        // ainda estava em andamento, descarta o resultado desatualizado.
        if (idDestaBusca !== idBuscaEndereco) return;
        preencherEnderecoNaTela(dados);
      })
      .catch(() => {
        if (idDestaBusca !== idBuscaEndereco) return;
        elEndereco1.textContent = 'Endereço não encontrado';
        elEndereco2.textContent = 'Coordenadas selecionadas manualmente';
        elEndereco3.textContent = '';
        ocorrencia.endereco = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
        mocauMostrarToast('Não foi possível identificar o endereço deste ponto.');
      });
  }

  function preencherEnderecoNaTela(dados) {
    const endereco = dados.address || {};

    const rua = endereco.road || endereco.pedestrian || endereco.footway || 'Local sem nome de rua';
    const numero = endereco.house_number ? `, ${endereco.house_number}` : '';
    const bairro = endereco.suburb || endereco.neighbourhood || endereco.village || '';
    const cidade = endereco.city || endereco.town || endereco.municipality || '';
    const estado = endereco.state || '';

    const linha1 = `${rua}${numero}`;
    const linha2 = bairro;
    const linha3 = [cidade, estado].filter(Boolean).join(' - ');

    elEndereco1.textContent = linha1;
    elEndereco2.textContent = linha2;
    elEndereco3.textContent = linha3;

    ocorrencia.endereco = [linha1, linha2, linha3].filter(Boolean).join(', ');
  }
  /* ------------------------------------------------------------------------
     2. EVENTOS
     ------------------------------------------------------------------------ */
  elBtnVoltar.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });

  elBtnLocalizacao.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      mocauMostrarToast('Seu navegador não suporta localização automática.');
      return;
    }

    elBtnLocalizacao.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        elBtnLocalizacao.disabled = false;
        const { latitude, longitude } = posicao.coords;
        mapa.setView([latitude, longitude], 17);
        moverMarcador(latitude, longitude);
      },
      () => {
        elBtnLocalizacao.disabled = false;
        mocauMostrarToast('Não foi possível obter sua localização agora.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  elDescricao.addEventListener('input', () => {
    const total = elDescricao.value.length;
    elContador.textContent = total;
    ocorrencia.descricao = elDescricao.value;
  });

  elBtnAddFoto.addEventListener('click', () => elInputFoto.click());
  elBtnAddVideo.addEventListener('click', () => elInputVideo.click());

  elInputFoto.addEventListener('change', (evento) => {
    adicionarAnexos(evento.target.files, 'foto');
    elInputFoto.value = '';
  });

  elInputVideo.addEventListener('change', (evento) => {
    adicionarAnexos(evento.target.files, 'video');
    elInputVideo.value = '';
  });

  elBtnRegistrar.addEventListener('click', registrarOcorrencia);

  elBtnFecharModal.addEventListener('click', () => {
    elModal.hidden = true;
    window.location.href = 'historico.html';
  });

  /* ------------------------------------------------------------------------
     3. DADOS DA OCORRÊNCIA
     ------------------------------------------------------------------------ */

  const ocorrencia = {
    descricao: '',
    latitude: COORD_INICIAL.lat,
    longitude: COORD_INICIAL.lng,
    endereco: elEndereco1 ? elEndereco1.textContent.trim() : '',
    fotos: [],
    videos: [],
    data: '',
  };

  function adicionarAnexos(arquivos, tipo) {
    if (!arquivos || !arquivos.length) return;

    Array.from(arquivos).forEach((arquivo) => {
      const url = URL.createObjectURL(arquivo);
      const item = { arquivo, url, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` };

      if (tipo === 'foto') {
        ocorrencia.fotos.push(item);
      } else {
        ocorrencia.videos.push(item);
      }

      renderizarPreview(item, tipo);
    });

    atualizarEstadoPreviewVazio();
  }

  function renderizarPreview(item, tipo) {
    const card = document.createElement('div');
    card.className = 'preview-item';
    card.dataset.id = item.id;
    card.dataset.tipo = tipo;

    if (tipo === 'foto') {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = 'Pré-visualização da foto anexada';
      card.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = item.url;
      video.muted = true;
      card.appendChild(video);

      const badge = document.createElement('span');
      badge.className = 'preview-item__video-badge';
      badge.innerHTML = '<i class="fa-solid fa-video"></i> vídeo';
      card.appendChild(badge);
    }

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'preview-item__remove';
    btnRemover.setAttribute('aria-label', 'Remover anexo');
    btnRemover.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    btnRemover.addEventListener('click', () => removerAnexo(item.id, tipo, card));

    card.appendChild(btnRemover);
    elPreviewGrid.appendChild(card);
  }

  function removerAnexo(id, tipo, card) {
    const lista = tipo === 'foto' ? ocorrencia.fotos : ocorrencia.videos;
    const indice = lista.findIndex((item) => item.id === id);

    if (indice !== -1) {
      URL.revokeObjectURL(lista[indice].url);
      lista.splice(indice, 1);
    }

    card.remove();
    atualizarEstadoPreviewVazio();
  }

  function atualizarEstadoPreviewVazio() {
    const semAnexos = ocorrencia.fotos.length === 0 && ocorrencia.videos.length === 0;
    elPreviewVazio.style.display = semAnexos ? 'flex' : 'none';
  }
  /* ------------------------------------------------------------------------
     4. VALIDAÇÃO
     ------------------------------------------------------------------------ */
  function validarOcorrencia() {
    if (ocorrencia.latitude == null || ocorrencia.longitude == null) {
      mocauMostrarToast('Selecione a localização da ocorrência no mapa.');
      return false;
    }

    const descricao = ocorrencia.descricao.trim();
    if (descricao.length < 10) {
      mocauMostrarToast('Descreva o ocorrido com pelo menos 10 caracteres.');
      return false;
    }

    return true;
  }
  /* ------------------------------------------------------------------------
     5. ARMAZENAMENTO E ENVIO
     ------------------------------------------------------------------------ */

  function registrarOcorrencia() {
    if (!validarOcorrencia()) return;

    ocorrencia.descricao = ocorrencia.descricao.trim();
    ocorrencia.data = new Date().toISOString();

    elBtnRegistrar.disabled = true;
    elBtnRegistrar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Enviando...</span>';

    // Simula uma chamada de rede. Quando existir uma API real, este trecho
    // deve ser substituído por um fetch/POST para o backend do MOCAU.
    setTimeout(() => {
      const protocolo = mocauGerarProtocolo();
      salvarOcorrenciaLocal(protocolo);

      elBtnRegistrar.disabled = false;
      elBtnRegistrar.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span>Registrar ocorrência</span>';

      elModalProtocolo.textContent = `Ocorrência #${protocolo}`;
      elModal.hidden = false;
    }, 900);
  }

  function salvarOcorrenciaLocal(protocolo) {
    const registroParaHistorico = {
      protocolo,
      descricao: ocorrencia.descricao,
      latitude: ocorrencia.latitude,
      longitude: ocorrencia.longitude,
      endereco: ocorrencia.endereco,
      totalFotos: ocorrencia.fotos.length,
      totalVideos: ocorrencia.videos.length,
      data: ocorrencia.data,
    };

    try {
      const chave = 'mocau_ocorrencias';
      const existentes = JSON.parse(localStorage.getItem(chave) || '[]');
      existentes.unshift(registroParaHistorico);
      localStorage.setItem(chave, JSON.stringify(existentes));
    } catch (erro) {
      // Armazenamento local é apenas um recurso de apoio; se falhar
      // (ex.: modo privado do navegador), a experiência não é bloqueada.
      console.warn('Não foi possível salvar a ocorrência em localStorage:', erro);
    }
  }

  document.addEventListener('DOMContentLoaded', iniciarMapa);
})();