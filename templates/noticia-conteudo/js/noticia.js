'use strict';

/**
 * NOTÍCIA DETALHE - LÓGICA DE INTERAÇÃO (TEMPLATE)
 * Este arquivo gerencia comportamentos visuais e interações básicas.
 */
(function() {
    function init() {
        initCompartilhamento();
    }

    // Gerencia as ações de compartilhamento
    function initCompartilhamento() {
        const shareBtns = document.querySelectorAll('.det-share-btn');
        const url = window.location.href;
        const title = document.querySelector('.det-titulo')?.innerText || 'Notícia - PMCGS';

        shareBtns.forEach(btn => {
            if (btn.classList.contains('fb')) {
                btn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                btn.target = '_blank';
            } else if (btn.classList.contains('wa')) {
                btn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
                btn.target = '_blank';
            } else if (btn.classList.contains('tg')) {
                btn.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                btn.target = '_blank';
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
