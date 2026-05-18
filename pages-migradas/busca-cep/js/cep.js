document.addEventListener("DOMContentLoaded", function() {
    // Seletores baseados no novo HTML (conteudo.html)
    const elements = {
        form: document.getElementById("cepForm"),
        streetNameInput: document.getElementById("logradouro"),
        resultContainer: document.getElementById("resultadoContainer"),
        resultContent: document.getElementById("resultado"),
        errorContainer: document.getElementById("erroContainer"),
        errorMessage: document.getElementById("erroMensagem"),
        loadingContainer: document.getElementById("loadingContainer")
    };

    // Termos para filtrar bairros (lógica original preservada)
    const filterTerms = ["campina grande do sul", "campina grande", "campina grande i"];

    // Mostra estado de carregamento
    const showLoading = () => {
        elements.resultContainer.classList.add("d-none");
        elements.errorContainer.classList.add("d-none");
        elements.loadingContainer.classList.remove("d-none");
    };

    // Esconde estado de carregamento
    const hideLoading = () => {
        elements.loadingContainer.classList.add("d-none");
    };

    // Mostra mensagem de erro
    const showError = (msg) => {
        elements.errorMessage.textContent = msg;
        elements.errorContainer.classList.remove("d-none");
        elements.resultContainer.classList.add("d-none");
    };

    // Formata o CEP (00000000 -> 00000-000)
    const formatCEP = (cep) => cep.replace(/(\d{5})(\d{3})/, "$1-$2");

    // Cria o card de resultado com as novas classes do portal
    const createResultCard = (item) => {
        const card = document.createElement("div");
        card.className = "cep-result-card";
        card.innerHTML = `
            <div class="cep-result-cep">${formatCEP(item.cep)}</div>
            <div class="cep-result-item"><strong>Logradouro:</strong> ${item.logradouro}</div>
            <div class="cep-result-item"><strong>Bairro:</strong> ${item.bairro || "-"}</div>
            <div class="cep-result-item"><strong>UF:</strong> ${item.uf}</div>
        `;
        return card;
    };

    // Filtra os resultados (lógica original preservada: remove complementos/unidades e termos específicos de bairro)
    const filterResults = (data) => {
        return data.filter(item => 
            !item.complemento && 
            !item.unidade && 
            item.bairro && 
            !filterTerms.some(term => item.bairro.toLowerCase().includes(term))
        );
    };

    // Limpa a tela ao digitar (opcional, para feedback imediato)
    const resetView = () => {
        elements.resultContainer.classList.add("d-none");
        elements.errorContainer.classList.add("d-none");
    };

    // Evento de Submit
    if (elements.form) {
        elements.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const logradouro = elements.streetNameInput.value.trim();

            if (!logradouro) {
                showError("Por favor, digite o nome do logradouro.");
                return;
            }

            // URL da API ViaCEP
            const url = `https://viacep.com.br/ws/PR/Campina%20Grande%20do%20Sul/${encodeURIComponent(logradouro)}/json/`;

            showLoading();
            elements.resultContent.innerHTML = "";

            try {
                const response = await fetch(url);
                const data = await response.json();

                hideLoading();

                // Verifica se retornou erro ou array vazio
                if (!Array.isArray(data) || data.length === 0 || data.erro) {
                    showError("Nenhum CEP encontrado para o logradouro informado.");
                    return;
                }

                // Aplica os filtros da regra de negócio original
                const filtered = filterResults(data);

                if (filtered.length === 0) {
                    showError("Nenhum CEP encontrado com os critérios especificados.");
                    return;
                }

                // Renderiza os resultados
                elements.resultContainer.classList.remove("d-none");
                filtered.forEach(item => {
                    elements.resultContent.appendChild(createResultCard(item));
                });

            } catch (err) {
                hideLoading();
                showError("Erro ao buscar o CEP. Por favor, tente novamente mais tarde.");
                console.error("Erro na busca de CEP:", err);
            }
        });
    }

    // Listener para limpar erro ao digitar
    if (elements.streetNameInput) {
        elements.streetNameInput.addEventListener("input", resetView);
    }
});
