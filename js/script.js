/**
 * Marca visualmente, na barra de navegação inferior, o item correspondente
 * à página atual como ativo (usa o nome do arquivo HTML atual).
 * Chamada automaticamente ao carregar qualquer página que tenha a bottom-nav.
 */
function mocauMarcarNavAtiva() {
  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bottom-nav .nav-item').forEach((link) => {
    const destino = link.getAttribute('href');
    link.classList.toggle('nav-item--active', destino === paginaAtual);
  });
}
/**
 * Exibe uma mensagem curta (toast) no rodapé da tela, usada para feedback
 * rápido de erros ou avisos (ex.: geolocalização indisponível).
 * Cria o elemento de toast automaticamente se ele ainda não existir.
 */
function mocauMostrarToast(mensagem, duracaoMs = 2600) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = mensagem;
  toast.classList.add('is-visible');

  clearTimeout(toast._timeoutId);
  toast._timeoutId = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, duracaoMs);
}
/**
 * Gera um número de protocolo simples no padrão MOCAU-XXXXX,
 * usado como identificador provisório enquanto não existe backend/API.
 */
function mocauGerarProtocolo() {
  const numero = Math.floor(10000 + Math.random() * 90000);
  return `MOCAU-${numero}`;
}

document.addEventListener('DOMContentLoaded', mocauMarcarNavAtiva);