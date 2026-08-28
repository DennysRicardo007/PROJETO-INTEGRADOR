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

