/**
 * Interatividade da Página de Processo Seletivo
 */

$(document).ready(function() {
    const $buscaInput = $('#busca-doc');
    const $filtrosRadios = $('input[name="options"]');
    const $listaDocs = $('#lista-documentos');
    const $docItems = $('.ps-doc-item');

    /**
     * Função principal de filtragem
     */
    function filtrarDocumentos() {
        const termoBusca = $buscaInput.val().toLowerCase();
        const categoriaAtiva = $('input[name="options"]:checked').attr('id').replace('filter-', '');

        $docItems.each(function() {
            const $item = $(this);
            const titulo = $item.find('.ps-doc-titulo').text().toLowerCase();
            const categoria = $item.data('category');

            const correspondeBusca = titulo.includes(termoBusca);
            const correspondeCategoria = (categoriaAtiva === 'all' || categoria === categoriaAtiva);

            if (correspondeBusca && correspondeCategoria) {
                $item.fadeIn(200);
            } else {
                $item.hide();
            }
        });

        // Feedback se não houver resultados
        const visiveis = $('.ps-doc-item:visible').length;
        if (visiveis === 0) {
            if ($('#no-results-msg').length === 0) {
                $listaDocs.append('<p id="no-results-msg" class="text-center py-5 text-muted">Nenhum documento encontrado para os critérios selecionados.</p>');
            }
        } else {
            $('#no-results-msg').remove();
        }
    }

    // Eventos
    $buscaInput.on('keyup', filtrarDocumentos);
    
    $filtrosRadios.on('change', function() {
        // Pequeno delay para garantir que o Bootstrap atualizou o estado do rádio
        setTimeout(filtrarDocumentos, 50);
    });

    // Efeito suave nos links âncora
    $('a[href^="#"]').on('click', function(event) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 100
            }, 800);
        }
    });
});
