// ==========================================================================
// nova-ocorrencia.js — Lógica da tela "Confirmar local" do MOCAL
// Mapa real com Leaflet + tiles do OpenStreetMap (sem chave de API).
// JavaScript puro, sem frameworks/bibliotecas de UI.
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {

  const CHAVE_LOCAL_STORAGE = 'mocal_endereco_selecionado';

  // Local inicial padrão, caso o navegador negue/não tenha geolocalização
  // (bairro Alto Santa Terezinha, Recife - PE, aproximado).
  const COORDENADA_PADRAO = { lat: -8.0330, lng: -34.9060 };
  const ZOOM_PADRAO = 17;

  // Nominatim (OpenStreetMap) é gratuito, mas tem limite de ~1 requisição/s
  // e não deve ser usado em produção com alto volume sem um proxy próprio
  // ou um provedor de geocodificação dedicado (ver documentação de uso justo
  // do OSM: https://operations.osmfoundation.org/policies/nominatim/).
  const URL_REVERSE_GEOCODE = 'https://nominatim.openstreetmap.org/reverse';

  let mapa = null;
  let atualizandoEnderecoTimeout = null;
  let ultimaRequisicaoId = 0;
  let coordenadaSelecionada = COORDENADA_PADRAO;

  const elMapaCarregando = document.getElementById('mapaCarregando');
  const elBotaoRecarregar = document.getElementById('botaoRecarregarMapa');
  const elEnderecoLinha1 = document.getElementById('enderecoLinha1');
  const elEnderecoLinha2 = document.getElementById('enderecoLinha2');

  // --- Botão voltar ----------------------------------------------------------
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

  // --- Inicialização do mapa ---------------------------------------------------

  function iniciarMapa(coordenadaInicial) {
    if (typeof L === 'undefined') {
      mostrarErroDeMapa('Não foi possível carregar o mapa.');
      return;
    }

    if (mapa) {
      mapa.setView([coordenadaInicial.lat, coordenadaInicial.lng], ZOOM_PADRAO);
      return;
    }

    mapa = L.map('mapa', {
      center: [coordenadaInicial.lat, coordenadaInicial.lng],
      zoom: ZOOM_PADRAO,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>'
    }).addTo(mapa);

    // O pino fica fixo no centro da tela (ver CSS .pino-mapa); o usuário
    // arrasta o MAPA por baixo dele para escolher o local, como em
    // Uber/99/Google Maps ao confirmar um endereço.
    mapa.on('moveend', function () {
      const centro = mapa.getCenter();
      coordenadaSelecionada = { lat: centro.lat, lng: centro.lng };
      agendarBuscaDeEndereco(coordenadaSelecionada);
    });

    mapa.on('load', esconderCarregandoMapa);

    // 'load' só dispara em alguns casos; garante que o overlay some assim
    // que os tiles começarem a aparecer.
    mapa.whenReady(function () {
      window.setTimeout(esconderCarregandoMapa, 150);
    });

    // Busca o endereço do ponto inicial assim que o mapa é criado.
    agendarBuscaDeEndereco(coordenadaInicial, 0);
  }

  function esconderCarregandoMapa() {
    if (elMapaCarregando) {
      elMapaCarregando.classList.add('oculto');
    }
  }

  function mostrarErroDeMapa(mensagem) {
    if (elMapaCarregando) {
      elMapaCarregando.querySelector('span').textContent = mensagem;
      elMapaCarregando.classList.remove('oculto');
    }
    if (elBotaoRecarregar) {
      elBotaoRecarregar.classList.add('visivel');
    }
  }

  // --- Geocodificação reversa (coordenadas -> endereço legível) ------------------

  function agendarBuscaDeEndereco(coordenada, atraso) {
    if (elEnderecoLinha2) {
      elEnderecoLinha2.textContent = 'Atualizando endereço…';
    }

    window.clearTimeout(atualizandoEnderecoTimeout);
    atualizandoEnderecoTimeout = window.setTimeout(function () {
      buscarEnderecoPorCoordenada(coordenada);
    }, atraso === undefined ? 500 : atraso); // debounce: evita 1 requisição por pixel arrastado
  }

  function buscarEnderecoPorCoordenada(coordenada) {
    const idRequisicaoAtual = ++ultimaRequisicaoId;
    const url = URL_REVERSE_GEOCODE +
      '?format=jsonv2&lat=' + encodeURIComponent(coordenada.lat) +
      '&lon=' + encodeURIComponent(coordenada.lng) +
      '&zoom=18&addressdetails=1';

    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (resposta) {
        if (!resposta.ok) {
          throw new Error('Falha na geocodificação reversa: ' + resposta.status);
        }
        return resposta.json();
      })
      .then(function (dados) {
        // Ignora respostas de requisições antigas (usuário já moveu o mapa de novo)
        if (idRequisicaoAtual !== ultimaRequisicaoId) {
          return;
        }
        preencherEnderecoComResultado(dados);
      })
      .catch(function (erro) {
        if (idRequisicaoAtual !== ultimaRequisicaoId) {
          return;
        }
        console.warn('Não foi possível obter o endereço:', erro.message);
        if (elEnderecoLinha2) {
          elEnderecoLinha2.textContent = 'Não foi possível identificar o endereço automaticamente';
        }
      });
  }

  function preencherEnderecoComResultado(dados) {
    const endereco = (dados && dados.address) || {};

    const via = endereco.road || endereco.pedestrian || endereco.residential || '';
    const numero = endereco.house_number ? (', ' + endereco.house_number) : '';
    const bairro = endereco.suburb || endereco.neighbourhood || endereco.quarter || '';

    const linha1 = via
      ? (via + numero)
      : (dados.display_name ? dados.display_name.split(',')[0] : 'Local selecionado');

    const cidade = endereco.city || endereco.town || endereco.municipality || '';
    const estado = endereco.state || '';

    const partesLinha2 = [bairro, [cidade, estado].filter(Boolean).join(' - ')]
      .filter(Boolean);

    if (elEnderecoLinha1) {
      elEnderecoLinha1.textContent = linha1;
    }
    if (elEnderecoLinha2) {
      elEnderecoLinha2.textContent = partesLinha2.length
        ? partesLinha2.join(' • ')
        : 'Endereço aproximado';
    }
  }

  // --- Tentar novamente (falha ao carregar o mapa) --------------------------------

  if (elBotaoRecarregar) {
    elBotaoRecarregar.addEventListener('click', function () {
      elBotaoRecarregar.classList.remove('visivel');
      if (elMapaCarregando) {
        elMapaCarregando.querySelector('span').textContent = 'Carregando mapa…';
        elMapaCarregando.classList.remove('oculto');
      }
      iniciarMapa(coordenadaSelecionada);
    });
  }

  // --- Usar minha localização ------------------------------------------------------

  const botaoLocalizacao = document.getElementById('botaoLocalizacao');

  function irParaLocalizacaoAtual(aoConcluir) {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocalização não é suportada neste dispositivo.');
      if (aoConcluir) aoConcluir();
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
          mapa.setView([coordenada.lat, coordenada.lng], ZOOM_PADRAO);
          // moveend cuidará de rebuscar o endereço; ainda assim buscamos
          // imediatamente para não depender apenas do evento de animação.
          agendarBuscaDeEndereco(coordenada, 0);
        }

        if (aoConcluir) aoConcluir();
      },
      function (erro) {
        console.warn('Não foi possível obter a localização:', erro.message);
        if (aoConcluir) aoConcluir();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  if (botaoLocalizacao) {
    botaoLocalizacao.addEventListener('click', function () {
      const rotuloBotao = botaoLocalizacao.querySelector('span:last-child');
      const textoOriginal = rotuloBotao.textContent;

      botaoLocalizacao.disabled = true;
      rotuloBotao.textContent = 'Localizando...';

      irParaLocalizacaoAtual(function () {
        botaoLocalizacao.disabled = false;
        rotuloBotao.textContent = textoOriginal;
      });
    });
  }

  // --- Próximo -------------------------------------------------------------------

  const botaoProximo = document.getElementById('botaoProximo');

  if (botaoProximo) {
    botaoProximo.addEventListener('click', function () {
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

  // --- Ponto de partida: tenta geolocalização do usuário; se negar/falhar,
  //     usa a coordenada padrão do bairro. ------------------------------------

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (posicao) {
        coordenadaSelecionada = {
          lat: posicao.coords.latitude,
          lng: posicao.coords.longitude
        };
        iniciarMapa(coordenadaSelecionada);
      },
      function () {
        iniciarMapa(COORDENADA_PADRAO);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    iniciarMapa(COORDENADA_PADRAO);
  }

});
