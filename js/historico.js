/* =========================================================
   MOCAU - HISTÓRICO DE OCORRÊNCIAS
   ========================================================= */

/*
 * Dados temporários para o protótipo.
 *
 * Quando o backend/API estiver pronto, esta estrutura pode ser
 * substituída pelos dados vindos do servidor sem precisar
 * reconstruir o HTML dos cards manualmente.
 */
const ocorrencias = [
    {
        endereco: "Rua Açuper - Alto Santa Terezinha, 331",
        localidade: "Recife - Pernambuco",
        protocolo: "xxxxxxxxxxxx",
        data: "27/08/2026",
        imagem: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80"
    },
    {
        endereco: "Rua Açuper - Alto Santa Terezinha, 331",
        localidade: "Recife - Pernambuco",
        protocolo: "xxxxxxxxxxxx",
        data: "01/08/2026",
        imagem: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80"
    },
    {
        endereco: "Rua Açuper - Alto Santa Terezinha, 331",
        localidade: "Recife - Pernambuco",
        protocolo: "xxxxxxxxxxxx",
        data: "09/07/2026",
        imagem: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80"
    }
];

const lista = document.getElementById("occurrences-list");
const emptyState = document.getElementById("empty-state");

/**
 * Escapa texto antes de inseri-lo no HTML.
 * Isso evita que dados vindos posteriormente de uma API
 * sejam interpretados como HTML.
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

/**
 * Cria o HTML de um card de ocorrência.
 */
function criarCard(ocorrencia) {
    return `
        <article class="occurrence-card">
            <img
                class="occurrence-image"
                src="${escapeHtml(ocorrencia.imagem)}"
                alt="Imagem do local da ocorrência"
                loading="lazy"
            >

            <div class="occurrence-info">
                <strong class="occurrence-address">
                    ${escapeHtml(ocorrencia.endereco)}
                </strong>

                <span class="occurrence-location">
                    ${escapeHtml(ocorrencia.localidade)}
                </span>

                <span class="occurrence-protocol">
                    <strong>Protocolo:</strong>
                    ${escapeHtml(ocorrencia.protocolo)}
                </span>

                <span class="occurrence-date">
                    <strong>Data:</strong>
                    ${escapeHtml(ocorrencia.data)}
                </span>
            </div>
        </article>
    `;
}

/**
 * Renderiza a lista de ocorrências.
 */
function renderizarOcorrencias(listaOcorrencias) {
    if (!listaOcorrencias.length) {
        lista.innerHTML = "";
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;
    lista.innerHTML = listaOcorrencias.map(criarCard).join("");
}

/**
 * Inicialização.
 */
renderizarOcorrencias(ocorrencias);

/*
 * O filtro "Todas" já está preparado para receber novos filtros
 * futuramente, por exemplo:
 *
 * - Todas
 * - Falta de água
 * - Vazamento
 * - Falta de energia
 * - Outros
 *
 * Neste momento, como o protótipo especifica apenas "Todas",
 * não adicionamos opções que não foram solicitadas.
 */
document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-button").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const filtro = button.dataset.filter;

        if (filtro === "todas") {
            renderizarOcorrencias(ocorrencias);
        }
    });
});

/*
 * Tratamento visual simples caso uma imagem externa falhe.
 */
document.addEventListener("error", (event) => {
    if (event.target.matches(".occurrence-image")) {
        event.target.src =
            "https://via.placeholder.com/400x300?text=MOCAU";
    }
}, true);
