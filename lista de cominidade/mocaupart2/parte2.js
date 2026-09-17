// Funcionalidade de busca por bairros
(function() {
    var campoBusca = document.getElementById('campo-busca');
    var itensBairro = document.querySelectorAll('.item-bairro');
    
    campoBusca.addEventListener('input', function() {
        var termo = this.value.toLowerCase().trim();
        
        itensBairro.forEach(function(item) {
            var nomeBairro = item.dataset.nome.toLowerCase();
            var subnome = item.querySelector('.item-bairro__subnome').textContent.toLowerCase();
            
            if (nomeBairro.includes(termo) || subnome.includes(termo)) {
                item.style.display = 'flex';
                // Efeito de destaque suave
                item.style.animation = 'none';
                setTimeout(function() {
                    item.style.animation = '';
                }, 10);
            } else {
                item.style.display = 'none';
            }
        });
    });
})();

// Clique nos itens de bairro
document.querySelectorAll('.item-bairro').forEach(function(item) {
    item.addEventListener('click', function() {
        var nomeBairro = this.dataset.nome;
        console.log('Bairro selecionado:', nomeBairro);
        
        // Efeito visual de clique
        this.style.transform = 'scale(0.98)';
        setTimeout(function() {
            item.style.transform = '';
        }, 150);
        
        // Aqui você pode adicionar a navegação para a tela do bairro
        // Exemplo: window.location.href = 'comunidade.html?bairro=' + encodeURIComponent(nomeBairro);
    });
});

// Botão "Ver todas os bairros"
document.getElementById('btn-ver-todos').addEventListener('click', function() {
    console.log('Mostrar todos os bairros');
    
    // Efeito de clique
    this.style.transform = 'scale(0.98)';
    setTimeout(function() {
        this.style.transform = '';
    }.bind(this), 150);
    
    // Limpar busca e mostrar todos
    var campoBusca = document.getElementById('campo-busca');
    campoBusca.value = '';
    
    document.querySelectorAll('.item-bairro').forEach(function(item) {
        item.style.display = 'flex';
    });
    
    campoBusca.focus();
});

// Botão voltar
document.querySelector('.btn-voltar').addEventListener('click', function() {
    console.log('Voltar');
    // Adicione a navegação de retorno aqui
    // Exemplo: window.history.back();
});

// Botões do rodapé
document.querySelectorAll('.rodape__item').forEach(function(botao) {
    botao.addEventListener('click', function() {
        var nome = this.querySelector('span').textContent;
        console.log('Navegar para:', nome);
        
        // Efeito visual
        document.querySelectorAll('.rodape__item').forEach(function(b) {
            b.classList.remove('rodape__item--ativo');
        });
        this.classList.add('rodape__item--ativo');
    });
});