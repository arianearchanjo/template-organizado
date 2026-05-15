/**
 * listagem-institucional.js
 * Funcionalidades para o template de listagem institucional.
 */

document.addEventListener('DOMContentLoaded', function() {
  const buscaInput = document.getElementById('li-busca');
  const tabela = document.getElementById('li-tabela-dados');
  
  if (buscaInput && tabela) {
    const rows = tabela.querySelectorAll('tbody tr');
    
    buscaInput.addEventListener('input', function() {
      const termo = buscaInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      
      rows.forEach(row => {
        const texto = row.innerText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        if (texto.includes(termo)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
      
      updateResultCount();
    });
  }

  function updateResultCount() {
    const visibleRows = tabela.querySelectorAll('tbody tr:not([style*="display: none"])').length;
    const infoSpan = document.querySelector('.li-pagination-info b');
    if (infoSpan) {
      // Simplificação para o template: apenas atualiza o número total visível
      // Numa integração real, isso lidaria com a paginação da API
    }
  }

  // Simulação de exportação
  const exportBtns = document.querySelectorAll('.li-export-btn');
  exportBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const format = this.innerText.trim();
      alert('Exportando dados para o formato: ' + format + '\n(Funcionalidade simulada para o template)');
    });
  });

  // Ordenação básica de colunas (visual)
  const headers = document.querySelectorAll('.li-table thead th[data-sortable="true"]');
  headers.forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', function() {
      const icon = this.querySelector('i');
      if (icon.classList.contains('fa-sort') || icon.classList.contains('fa-sort-down')) {
        icon.className = 'fas fa-sort-up';
      } else {
        icon.className = 'fas fa-sort-down';
      }
      // Numa implementação real, aqui dispararia a lógica de ordenação dos dados
    });
  });
});
