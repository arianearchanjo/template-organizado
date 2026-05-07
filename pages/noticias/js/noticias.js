'use strict';

/**
 * NOTÍCIAS - LÓGICA DE INTERAÇÃO (TEMPLATE)
 * Este arquivo gerencia apenas o comportamento visual do template.
 * A integração com dados reais deve ser feita na migração para CSHTML.
 */
(function() {
    function init() {
        initFiltros();
        initPaginacao();
    }

    // Gerencia o estado visual dos botões de categoria
    function initFiltros() {
        const container = document.getElementById('not-cats-scroll');
        if (!container) return;

        // Categorias padrão para o template
        const categorias = ["Todas", "Administração", "Cultura", "Desenvolvimento Econômico", "Desenvolvimento Social", "Educação", "Governo", "Infraestrutura", "Saúde", "Tecnologia", "Urbanismo", "Obras"];
        
        container.innerHTML = categorias.map(cat => `
            <button class="not-cat-btn ${cat === 'Todas' ? 'active' : ''}" data-cat="${cat}">
                ${cat}
            </button>
        `).join('');

        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.not-cat-btn');
            if (btn) {
                container.querySelectorAll('.not-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                console.log('Filtro selecionado (Front-only):', btn.dataset.cat);
            }
        });
    }

    // Gerencia o estado visual da paginação
    function initPaginacao() {
        const container = document.getElementById('not-paginacao');
        if (!container) return;

        // Exemplo estático de paginação
        container.innerHTML = `
            <a href="#" class="not-pag-btn disabled" aria-label="Página anterior">
                <i class="fas fa-chevron-left"></i>
            </a>
            <a href="#" class="not-pag-btn active">1</a>
            <a href="#" class="not-pag-btn">2</a>
            <a href="#" class="not-pag-btn">3</a>
            <a href="#" class="not-pag-btn" aria-label="Próxima página">
                <i class="fas fa-chevron-right"></i>
            </a>
        `;

        container.addEventListener('click', function(e) {
            const btn = e.target.closest('.not-pag-btn:not(.disabled)');
            if (btn) {
                e.preventDefault();
                container.querySelectorAll('.not-pag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    }

    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
