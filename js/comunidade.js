// Seção expansível (colapsar/expandir "Outros Perfis")
document.querySelectorAll(".secao-expansivel").forEach(function(botao) {
    botao.addEventListener("click", function() {
        var alvo = document.getElementById(botao.dataset.alvo);
        var estaAberto = botao.getAttribute("aria-expanded") === "true";
        
        botao.setAttribute("aria-expanded", !estaAberto);
        
        if (alvo) {
            alvo.style.display = estaAberto ? "none" : "flex";
        }
    });
});

// Sistema de feedback Like/Deslike
(function() {
    var btnLike = document.getElementById('btn-like');
    var btnDeslike = document.getElementById('btn-deslike');
    var ocorrencia = document.getElementById('ocorrencia-principal');
    var selo = document.getElementById('selo-principal');
    var icone = document.getElementById('icone-principal');

    // Função para resetar tudo ao estado padrão
    function resetarStatus() {
        btnLike.classList.remove('active');
        btnDeslike.classList.remove('active');
        ocorrencia.classList.remove('status-resolvida', 'status-adamento');
        selo.classList.remove('resolvida', 'adamento');
        selo.textContent = 'Em atendimento';
        icone.setAttribute('fill', '#4a90d9');
    }

   
    btnLike.addEventListener('click', function() {
        if (btnLike.classList.contains('active')) {
            
            resetarStatus();
        } else {
            
            resetarStatus();
            btnLike.classList.add('active');
            ocorrencia.classList.add('status-resolvida');
            selo.classList.add('resolvida');
            selo.textContent = 'Resolvida';
            icone.setAttribute('fill', '#0d9669');
        }
    });

    btnDeslike.addEventListener('click', function() {
        if (btnDeslike.classList.contains('active')) {
            
            resetarStatus();
        } else {
          
            resetarStatus();
            btnDeslike.classList.add('active');
            ocorrencia.classList.add('status-adamento');
            selo.classList.add('adamento');
            selo.textContent = 'Em adiamento';
            icone.setAttribute('fill', '#d97706');
        }
    });
})();
