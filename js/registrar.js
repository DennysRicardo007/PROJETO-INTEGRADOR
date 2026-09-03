// ==========================================================================
// registrar.js — Lógica da tela "Registrar" do MOCAL
// JavaScript puro, sem frameworks/bibliotecas externas.
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {

  // --- Botão voltar -------------------------------------------------------
  const botaoVoltar = document.getElementById('botaoVoltar');

  if (botaoVoltar) {
    botaoVoltar.addEventListener('click', function () {
      // Se existir histórico de navegação, volta para a página anterior.
      // Caso contrário, direciona para home.html.
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'home.html';
      }
    });
  }

  // --- Seleção de categoria de problema ------------------------------------
  const cardsOpcoes = document.querySelectorAll('.card-opcao');
  const CHAVE_LOCAL_STORAGE = 'mocal_problema_selecionado';

  if (cardsOpcoes.length > 0) {
    cardsOpcoes.forEach(function (card) {
      card.addEventListener('click', function () {
        const categoriaSelecionada = card.dataset.categoria;

        if (!categoriaSelecionada) {
          return;
        }

        // 1. Remove destaque de qualquer seleção anterior
        cardsOpcoes.forEach(function (c) {
          c.classList.remove('card-opcao-selecionado');
        });

        // 2. Aplica feedback visual no card selecionado
        card.classList.add('card-opcao-selecionado');

        // 3. Salva a categoria escolhida no localStorage
        try {
          window.localStorage.setItem(CHAVE_LOCAL_STORAGE, categoriaSelecionada);
        } catch (erro) {
          // localStorage pode falhar em modo privado/navegação restrita
          console.warn('Não foi possível salvar no localStorage:', erro);
        }

        // 4. Direciona o usuário para a próxima etapa após um pequeno atraso,
        //    para que o feedback visual seja percebido antes da navegação.
        window.setTimeout(function () {
          window.location.href = 'registrar2.html';
        }, 200);
      });
    });
  }

  // --------------------------------------------------------------------
  // Como testar a seleção de categoria antes de nova-ocorrencia.html existir:
  //
  // 1. Comente temporariamente a linha "window.location.href = ...' acima.
  // 2. Clique em uma das opções (ex: "Falta de água").
  // 3. Abra o Console do navegador (F12) e digite:
  //      localStorage.getItem('mocal_problema_selecionado')
  //    O valor exibido deve ser algo como "falta-de-agua".
  // 4. Quando nova-ocorrencia.html estiver pronta, descomente a linha
  //    de redirecionamento novamente.
  // --------------------------------------------------------------------

});