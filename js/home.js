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