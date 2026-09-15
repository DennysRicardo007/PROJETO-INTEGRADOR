document.addEventListener('DOMContentLoaded', function () {
  const botaoVoltar = document.getElementById('botaoVoltar');
  const botaoProximo = document.getElementById('botaoProximo');

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

  if (botaoProximo) {
    botaoProximo.addEventListener('click', function () {
      const descricao = document.getElementById('descricaoProblema');

      try {
        window.localStorage.setItem(
          'mocal_descricao_ocorrencia',
          descricao ? descricao.value.trim() : ''
        );
      } catch (erro) {
        console.warn('Não foi possível salvar a descrição:', erro);
      }

      window.location.href = './mapa_ocorrencia.html';
    });
  }
});
