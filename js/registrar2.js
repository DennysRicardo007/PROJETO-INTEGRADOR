document.addEventListener('DOMContentLoaded', function () {
  const botaoVoltar = document.getElementById('botaoVoltar');

  if (!botaoVoltar) {
    return;
  }

  botaoVoltar.addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = './registrar.html';
  });
});
