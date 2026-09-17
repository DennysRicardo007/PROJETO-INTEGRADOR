document.addEventListener('DOMContentLoaded', function () {
  const botaoVoltar = document.getElementById('botaoVoltar');
  const botaoProximo = document.getElementById('botaoProximo');
  const arquivoAnexo = document.getElementById('arquivoAnexo');
  const previewAnexo = document.getElementById('previewAnexo');
  const rotuloAnexo = document.querySelector('.rotulo-anexo');
  let urlPreview = null;

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

  if (arquivoAnexo && previewAnexo && rotuloAnexo) {
    arquivoAnexo.addEventListener('change', function () {
      const arquivo = arquivoAnexo.files && arquivoAnexo.files[0];

      if (!arquivo) {
        previewAnexo.hidden = true;
        previewAnexo.removeAttribute('src');
        rotuloAnexo.hidden = false;
        return;
      }

      if (urlPreview) {
        URL.revokeObjectURL(urlPreview);
      }

      urlPreview = URL.createObjectURL(arquivo);
      previewAnexo.src = urlPreview;
      previewAnexo.hidden = false;
      rotuloAnexo.hidden = true;
    });
  }
});
