const app = document.getElementById('app');

function abrirMenu() {
  app.classList.add('menu-aberto');
}

function fecharMenu() {
  app.classList.remove('menu-aberto');
}

const dadosOcorrencias = [
  ['falta-agua', 'Falta de água', 'Rua Açuper - Alto Santa Terezinha, 331', 'icone-falta-agua.png'],
  ['falta-agua', 'Falta de água durante o dia', 'Rua do Hospício - Boa Vista, 245', 'icone-falta-agua.png'],
  ['falta-agua', 'Abastecimento interrompido', 'Av. Norte Miguel Arraes - Casa Amarela, 1180', 'icone-falta-agua.png'],
  ['falta-agua', 'Baixa pressão na rede', 'Rua Real da Torre - Madalena, 760', 'icone-falta-agua.png'],
  ['vazamento-agua', 'Vazamento na calçada', 'Rua da Aurora - Santo Amaro, 920', 'icone-vazamento.png'],
  ['vazamento-agua', 'Vazamento em tubulação', 'Av. Caxangá - Cordeiro, 2700', 'icone-vazamento.png'],
  ['vazamento-agua', 'Vazamento de água', 'Rua Joaquim Nabuco - Graças, 460', 'icone-vazamento.png'],
  ['vazamento-agua', 'Vazamento próximo ao meio-fio', 'Rua Conselheiro Portela - Espinheiro, 315', 'icone-vazamento.png'],
  ['esgoto', 'Esgoto a céu aberto', 'Av. Mascarenhas de Morais - Imbiribeira, 1500', 'icone-esgoto.png'],
  ['esgoto', 'Retorno de esgoto', 'Rua dos Navegantes - Boa Viagem, 880', 'icone-esgoto.png'],
  ['esgoto', 'Esgoto escorrendo pela rua', 'Rua Dr. José Maria - Encruzilhada, 210', 'icone-esgoto.png'],
  ['esgoto', 'Bueiro com esgoto exposto', 'Rua do Príncipe - Recife, 360', 'icone-esgoto.png'],
  ['lixo', 'Lixo acumulado', 'Av. Abdias de Carvalho - Prado, 1850', 'icone-lixo.png'],
  ['lixo', 'Descarte irregular de lixo', 'Rua Barão de Souza Leão - Boa Viagem, 1140', 'icone-lixo.png'],
  ['lixo', 'Coleta de lixo atrasada', 'Rua do Sol - Santo Antônio, 185', 'icone-lixo.png'],
  ['lixo', 'Entulho acumulado na calçada', 'Rua do Futuro - Aflitos, 410', 'icone-lixo.png'],
  ['outros', 'Bueiro danificado', 'Rua Imperial - São José, 640', 'icone-outros.png'],
  ['outros', 'Calçada danificada', 'Av. Dois Rios - Ibura, 870', 'icone-outros.png'],
  ['outros', 'Tampa de inspeção quebrada', 'Rua Antônio Falcão - Boa Viagem, 520', 'icone-outros.png'],
  ['outros', 'Obstrução na rede pública', 'Rua Padre Roma - Parnamirim, 95', 'icone-outros.png'],
  ['outros', 'Problema de drenagem urbana', 'Rua do Riachuelo - Boa Vista, 530', 'icone-outros.png']
];

const listaOcorrencias = document.querySelectorAll('.ocorrencias-lista .ocorrencia');

listaOcorrencias.forEach((ocorrencia, indice) => {
  const dados = dadosOcorrencias[indice];

  if (!dados) {
    ocorrencia.remove();
    return;
  }

  const [categoria, titulo, endereco, icone] = dados;
  const iconeOcorrencia = ocorrencia.querySelector('.ocorrencia-icone');
  const tituloOcorrencia = ocorrencia.querySelector('.ocorrencia-texto strong');
  const enderecoOcorrencia = ocorrencia.querySelector('.ocorrencia-texto span');
  const imagemLocal = ocorrencia.querySelector(':scope > img');

  ocorrencia.className = `ocorrencia ${categoria}`;
  iconeOcorrencia.innerHTML = `<img src="/img/${icone}" alt="${titulo}">`;
  tituloOcorrencia.textContent = titulo;
  enderecoOcorrencia.textContent = endereco;
  imagemLocal.alt = `Local da ocorrência: ${endereco}`;
});

function exportarDados() {
  const escaparCsv = (valor) => `"${valor.replace(/"/g, '""')}"`;
  const csv = [
    'protocolo,categoria,endereco,status,data',
    ...dadosOcorrencias.map(([, titulo, endereco], indice) => (
      `MOC-${String(indice + 1).padStart(4, '0')},${escaparCsv(titulo)},${escaparCsv(endereco)},Em atendimento,2026-09-17`
    ))
  ].join('\n');
  const arquivo = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'dados-mocau.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const exportarDadosItem = document.getElementById('exportarDados');

if (exportarDadosItem) {
  exportarDadosItem.addEventListener('click', exportarDados);
  exportarDadosItem.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      exportarDados();
    }
  });
}

const modalConfig = {
  mapa: {
    title: 'Mapa',
    description: 'Você será redirecionado para a visualização das ocorrências por região.',
    href: 'mapa.html',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16"></path></svg>'
  },
  registrar: {
    title: 'Registrar',
    description: 'Você será levado para a tela de registro de uma nova ocorrência.',
    href: 'registrar.html',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>'
  },
  historico: {
    title: 'Histórico',
    description: 'Acesse seu histórico de ocorrências cadastradas e acompanhadas.',
    href: 'historico.html',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  },
  comunidade: {
    title: 'Comunidade',
    description: 'Você será levado para o mural e às atualizações da sua comunidade.',
    href: 'comunidade.html',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  }
};

const modalAcesso = document.getElementById('modalAcesso');
const modalTitulo = document.getElementById('modalTitulo');
const modalDescricao = document.getElementById('modalDescricao');
const modalIcon = document.getElementById('modalIcon');
const modalLink = document.getElementById('confirmarModal');
const fecharModalBtn = document.querySelector('.modal-close');
const cancelarModalBtn = document.getElementById('cancelarModal');

function abrirModalAcesso(chave) {
  const config = modalConfig[chave];

  if (!config || !modalAcesso || !modalTitulo || !modalDescricao || !modalIcon || !modalLink) {
    return;
  }

  modalTitulo.textContent = config.title;
  modalDescricao.textContent = config.description;
  modalIcon.innerHTML = config.icon;
  modalLink.href = config.href;
  modalLink.textContent = 'Abrir página';
  modalAcesso.classList.remove('hidden');
  modalAcesso.setAttribute('aria-hidden', 'false');
}

function fecharModalAcesso() {
  if (!modalAcesso) return;
  modalAcesso.classList.add('hidden');
  modalAcesso.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.btn-action').forEach(function (botao) {
  botao.addEventListener('click', function (evento) {
    evento.preventDefault();
    const chave = botao.dataset.action;
    abrirModalAcesso(chave);
  });
});

if (fecharModalBtn) {
  fecharModalBtn.addEventListener('click', fecharModalAcesso);
}

if (cancelarModalBtn) {
  cancelarModalBtn.addEventListener('click', fecharModalAcesso);
}

if (modalAcesso) {
  modalAcesso.addEventListener('click', function (evento) {
    if (evento.target === modalAcesso) {
      fecharModalAcesso();
    }
  });
}

if (modalLink) {
  modalLink.addEventListener('click', function () {
    fecharModalAcesso();
  });
}