// ==========================================================================
// nova-ocorrencia.js — Lógica da tela "Confirmar local" do MOCAL
// Mapa real com a Google Maps JavaScript API + Geocoding API.
// Segue o mesmo padrão de carregamento usado em js/maps.js (tela Mapa):
// o script da API é injetado direto no HTML, com callback global.
// ==========================================================================

let mapa = null;
let geocoder = null;
let mapaJaCarregado = false;

let atualizandoEnderecoTimeout = null;
let ultimaRequisicaoId = 0;

// Local inicial padrão, caso o navegador negue/não tenha geolocalização
// (bairro Alto Santa Terezinha, Recife - PE, aproximado).
const COORDENADA_PADRAO = { lat: -8.0330, lng: -34.9060 };
const ZOOM_PADRAO = 17;
const CHAVE_LOCAL_STORAGE = 'mocal_endereco_selecionado';

let coordenadaSelecionada = COORDENADA_PADRAO;

// --- Inicialização do mapa (chamada pelo callback do script da Google Maps) ----

function iniciarMapaOcorrencia() {
  console.log('Inicializando mapa de confirmação de local...');

  mapa = new google.maps.Map(document.getElementById('mapa'), {
    zoom: ZOOM_PADRAO,
    center: coordenadaSelecionada,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy' // permite arrastar com 1 dedo no mobile
  });

  geocoder = new google.maps.Geocoder();
  mapaJaCarregado = true;

  // O pino fica fixo no centro da tela (ver CSS .pino-mapa); o usuário
  // arrasta o MAPA por baixo dele para escolher o local, como em
  // Uber/99/Google Maps ao confirmar um endereço.
  mapa.addListener('idle', function () {
    const centro = mapa.getCenter();
    coordenadaSelecionada = { lat: centro.lat(), lng: centro.lng() };
    agendarBuscaDeEndereco(coordenadaSelecionada);
  });

  mapa.addListener('tilesloaded', esconderCarregandoMapa);

  // Busca o endereço do ponto inicial assim que o mapa é criado.
  agendarBuscaDeEndereco(coordenadaSelecionada, 0);

  // Assim que o mapa estiver pronto, tenta recentralizar na localização
  // real do usuário (não bloqueia a criação do mapa, que já usa o local
  // padrão enquanto isso).
  tentarCentralizarNaLocalizacaoDoUsuario();

  console.log('✅ Mapa de confirmação de local inicializado com sucesso');
}

window.iniciarMapaOcorrencia = iniciarMapaOcorrencia;

// Reinicializa/redimensiona o mapa quando a página volta a ficar visível
// (mesmo comportamento usado em js/maps.js na tela Mapa).
document.addEventListener('visibilitychange', function () {
  if (!document.hidden && mapaJaCarregado && mapa) {
    console.log('Página voltou a ficar visível');
    google.maps.event.trigger(mapa, 'resize');
  }
});

// Tenta inicializar se o script da Google Maps já tiver carregado antes
// deste arquivo (ex: cache do navegador).
document.addEventListener('DOMContentLoaded', function () {
  if (window.google && window.google.maps && !mapaJaCarregado) {
    iniciarMapaOcorrencia();
  }
});

function esconderCarregandoMapa() {
  const elMapaCarregando = document.getElementById('mapaCarregando');
  if (elMapaCarregando) {
    elMapaCarregando.classList.add('oculto');
  }
}

function mostrarErroDeMapa(mensagem) {
  const elMapaCarregando = document.getElementById('mapaCarregando');
  const elBotaoRecarregar = document.getElementById('botaoRecarregarMapa');

  if (elMapaCarregando) {
    elMapaCarregando.querySelector('span').textContent = mensagem;
    elMapaCarregando.classList.remove('oculto');
  }
  if (elBotaoRecarregar) {
    elBotaoRecarregar.classList.add('visivel');
  }
}

// Callback global chamado pela própria API do Google quando a chave é
// inválida, tem restrições incompatíveis, ou o faturamento está inativo.
window.gm_authFailure = function () {
  mostrarErroDeMapa('Chave da API do Google Maps inválida ou sem permissão.');
};

// --- Geocodificação reversa (coordenadas -> endereço legível) ---------------

function agendarBuscaDeEndereco(coordenada, atraso) {
  const elEnderecoLinha2 = document.getElementById('enderecoLinha2');
  if (elEnderecoLinha2) {
    elEnderecoLinha2.textContent = 'Atualizando endereço…';
  }

  window.clearTimeout(atualizandoEnderecoTimeout);
  atualizandoEnderecoTimeout = window.setTimeout(function () {
    buscarEnderecoPorCoordenada(coordenada);
  }, atraso === undefined ? 500 : atraso); // debounce: evita 1 requisição por pixel arrastado
}

function buscarEnderecoPorCoordenada(coordenada) {
  if (!geocoder) {
    return;
  }

  const idRequisicaoAtual = ++ultimaRequisicaoId;

  geocoder.geocode({ location: coordenada }, function (resultados, status) {
    // Ignora respostas de requisições antigas (usuário já moveu o mapa de novo)
    if (idRequisicaoAtual !== ultimaRequisicaoId) {
      return;
    }

    const elEnderecoLinha2 = document.getElementById('enderecoLinha2');

    if (status !== 'OK' || !resultados || !resultados.length) {
      console.warn('Geocodificação reversa falhou:', status);
      if (elEnderecoLinha2) {
        elEnderecoLinha2.textContent = 'Não foi possível identificar o endereço automaticamente';
      }
      return;
    }

    preencherEnderecoComResultado(resultados[0]);
  });
}

function preencherEnderecoComResultado(resultado) {
  const componentes = resultado.address_components || [];

  function pegarComponente(tipo) {
    const encontrado = componentes.find(function (c) {
      return c.types.indexOf(tipo) !== -1;
    });
    return encontrado ? encontrado.long_name : '';
  }

  const via = pegarComponente('route');
  const numero = pegarComponente('street_number');
  const bairro = pegarComponente('sublocality') || pegarComponente('neighborhood');
  const cidade = pegarComponente('administrative_area_level_2') || pegarComponente('locality');
  const estado = pegarComponente('administrative_area_level_1');

  const linha1 = via
    ? (via + (numero ? (', ' + numero) : ''))
    : (resultado.formatted_address ? resultado.formatted_address.split(',')[0] : 'Local selecionado');

  const partesLinha2 = [bairro, [cidade, estado].filter(Boolean).join(' - ')]
    .filter(Boolean);

  const elEnderecoLinha1 = document.getElementById('enderecoLinha1');
  const elEnderecoLinha2 = document.getElementById('enderecoLinha2');

  if (elEnderecoLinha1) {
    elEnderecoLinha1.textContent = linha1;
  }
  if (elEnderecoLinha2) {
    elEnderecoLinha2.textContent = partesLinha2.length
      ? partesLinha2.join(' • ')
      : 'Endereço aproximado';
  }
}

// --- Geolocalização do usuário -----------------------------------------------

function tentarCentralizarNaLocalizacaoDoUsuario() {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocalização não é suportada neste dispositivo.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (posicao) {
      const coordenada = {
        lat: posicao.coords.latitude,
        lng: posicao.coords.longitude
      };
      coordenadaSelecionada = coordenada;

      if (mapa) {
        mapa.setCenter(coordenada);
        mapa.setZoom(ZOOM_PADRAO);
        // O evento 'idle' cuidará de rebuscar o endereço automaticamente.
      }
    },
    function (erro) {
      console.warn('Não foi possível obter a localização automaticamente:', erro.message);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// --- Interações da tela (rodam assim que o DOM estiver pronto) ----------------

document.addEventListener('DOMContentLoaded', function () {

  // --- Botão voltar -----------------------------------------------------------
  const botaoVoltar = document.getElementById('botaoVoltar');

  if (botaoVoltar) {
    botaoVoltar.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'registrar.html';
      }
    });
  }

  // --- Tentar novamente (falha ao carregar o mapa) -----------------------------
  const botaoRecarregar = document.getElementById('botaoRecarregarMapa');

  if (botaoRecarregar) {
    botaoRecarregar.addEventListener('click', function () {
      botaoRecarregar.classList.remove('visivel');
      const elMapaCarregando = document.getElementById('mapaCarregando');
      if (elMapaCarregando) {
        elMapaCarregando.querySelector('span').textContent = 'Carregando mapa…';
        elMapaCarregando.classList.remove('oculto');
      }

      if (window.google && window.google.maps) {
        iniciarMapaOcorrencia();
      } else {
        window.location.reload();
      }
    });
  }

  // --- Usar minha localização ---------------------------------------------------
  const botaoLocalizacao = document.getElementById('botaoLocalizacao');

  if (botaoLocalizacao) {
    botaoLocalizacao.addEventListener('click', function () {
      const rotuloBotao = botaoLocalizacao.querySelector('span:last-child');
      const textoOriginal = rotuloBotao.textContent;

      if (!('geolocation' in navigator)) {
        console.warn('Geolocalização não é suportada neste dispositivo.');
        return;
      }

      botaoLocalizacao.disabled = true;
      rotuloBotao.textContent = 'Localizando...';

      navigator.geolocation.getCurrentPosition(
        function (posicao) {
          const coordenada = {
            lat: posicao.coords.latitude,
            lng: posicao.coords.longitude
          };
          coordenadaSelecionada = coordenada;

          if (mapa) {
            mapa.setCenter(coordenada);
            mapa.setZoom(ZOOM_PADRAO);
          }

          botaoLocalizacao.disabled = false;
          rotuloBotao.textContent = textoOriginal;
        },
        function (erro) {
          console.warn('Não foi possível obter a localização:', erro.message);
          botaoLocalizacao.disabled = false;
          rotuloBotao.textContent = textoOriginal;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  // --- Próximo -------------------------------------------------------------------
  const botaoProximo = document.getElementById('botaoProximo');

  if (botaoProximo) {
    botaoProximo.addEventListener('click', function () {
      const elEnderecoLinha1 = document.getElementById('enderecoLinha1');
      const elEnderecoLinha2 = document.getElementById('enderecoLinha2');

      const endereco = {
        linha1: elEnderecoLinha1 ? elEnderecoLinha1.textContent.trim() : '',
        linha2: elEnderecoLinha2 ? elEnderecoLinha2.textContent.trim() : '',
        latitude: coordenadaSelecionada.lat,
        longitude: coordenadaSelecionada.lng
      };

      try {
        window.localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(endereco));
      } catch (erro) {
        // localStorage pode falhar em modo privado/navegação restrita
        console.warn('Não foi possível salvar no localStorage:', erro);
      }

      // TODO: atualizar para a próxima etapa real do fluxo de registro
      // (ex: tela de detalhes/foto da ocorrência) quando ela existir.
      window.location.href = 'detalhes-ocorrencia.html';
    });
  }

});
