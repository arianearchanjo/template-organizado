document.addEventListener('DOMContentLoaded', function () {

  // Variáveis de cores
  const cores = {
    verde: '#2d7a2d',
    verdeEscuro: '#1e5c1e',
    verdeMedio: '#3a9a3a',
    verdeClaro: '#e8f5e8',
    azulBar: '#1a4f8a',
    amarelo: '#f5c518',
    cinzaBg: '#eef2ee',
    cinzaBorda: '#c8d8c8',
    texto: '#1a2a1a'
  };

  function restyleFiles() {
    const container = document.querySelector('.spweb-file');
    if (!container) return;

    const accordionOld = container.querySelector('#accordionfiles');
    if (!accordionOld || accordionOld.dataset.restyled === 'true') return;

    accordionOld.dataset.restyled = 'true';

    const categories = [];
    const rows = container.querySelectorAll('tbody tr');

    rows.forEach((row, index) => {
      const link = row.querySelector('td.text-info > a');
      const contentDiv = row.querySelector('.collapse');
      const filesList = contentDiv ? contentDiv.querySelectorAll('ul li a') : [];

      if (link && contentDiv) {
        const title = link.textContent.trim();

        const yearMatch = title.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : 'Outros';

        const files = Array.from(filesList).map(f => ({
          name: f.textContent.trim(),
          url: f.getAttribute('href'),
          ext: f.getAttribute('href').split('.').pop().toLowerCase()
        }));

        categories.push({
          id: `cat_modern_${index}`,
          title,
          year,
          files
        });
      }
    });

    if (categories.length === 0) return;

    // FILTRO
    const years = [...new Set(categories.map(c => c.year))].sort((a, b) => b - a);

    let filterHtml = `
      <div class="d-flex flex-wrap align-items-center mb-4 p-3 rounded shadow-sm filter-container"
           style="
              background:${cores.cinzaBg};
              border-left:4px solid ${cores.verde};
           ">
           
        <span class="mr-3 font-weight-bold"
              style="color:${cores.texto};">
              
          <i class="fas fa-filter"
             style="color:${cores.verde};"></i>

          Filtrar:
        </span>

        <button
          class="btn btn-sm mr-2 mb-1 mt-1 btn-prefeitura active btn-filter-year"
          data-year="all">
          Todos
        </button>
    `;

    years.forEach(year => {
      filterHtml += `
        <button
          class="btn btn-sm mr-2 mb-1 mt-1 btn-outline-prefeitura btn-filter-year"
          data-year="${year}">
          ${year}
        </button>
      `;
    });

    filterHtml += `</div>`;

    // ACCORDION
    let newHtml = filterHtml + '<div class="accordion" id="modernFilesAccordion">';

    categories.forEach((cat) => {

      newHtml += `
        <div class="card mb-3 border-0 shadow-sm file-category-wrapper"
             data-year="${cat.year}"
             style="
                border-radius:12px;
                overflow:hidden;
                background:#fff;
                border:1px solid ${cores.cinzaBorda};
             ">

          <div class="card-header border-0 p-0"
               style="background:#fff;"
               id="heading_${cat.id}">

            <h2 class="mb-0">

              <button
                class="btn btn-link btn-block text-left font-weight-bold p-4 d-flex justify-content-between align-items-center modern-accordion-btn text-decoration-none collapsed"
                type="button"
                data-toggle="collapse"
                data-target="#collapse_${cat.id}"
                aria-expanded="false"
                aria-controls="collapse_${cat.id}"
                style="
                  color:${cores.texto};
                  background:#fff;
                ">

                <span class="d-flex align-items-center"
                      style="font-size:1.1rem;">

                  <i class="fas fa-folder-open mr-3"
                     style="
                       color:${cores.verde};
                       font-size:1.3rem;
                     "></i>

                  ${cat.title}
                </span>

                <span class="d-flex align-items-center">

                  <span class="badge mr-3 py-2 px-3 badge-year"
                        style="
                          background:${cores.verdeClaro};
                          color:${cores.verdeEscuro};
                          border:1px solid ${cores.cinzaBorda};
                        ">
                    ${cat.year}
                  </span>

                  <i class="fas fa-chevron-down transition-icon"
                     style="color:${cores.verde};"></i>

                </span>

              </button>

            </h2>

          </div>

          <div id="collapse_${cat.id}"
               class="collapse"
               aria-labelledby="heading_${cat.id}"
               data-parent="#modernFilesAccordion">

            <div class="card-body p-0 border-top">

              <div class="list-group list-group-flush">

                ${cat.files.map(file => `

                  <a href="${file.url}"
                     target="_blank"
                     class="list-group-item list-group-item-action d-flex align-items-center py-3 border-bottom-0 modern-file-item"
                     style="
                       border-left:3px solid transparent;
                       transition:0.2s ease;
                     ">

                    <div class="icon-wrapper mr-3 d-flex justify-content-center align-items-center rounded"
                         style="
                            width:42px;
                            height:42px;
                            background:${cores.verdeClaro};
                            border:1px solid ${cores.cinzaBorda};
                         ">

                      <i class="${getFileIcon(file.ext)}"></i>

                    </div>

                    <div class="flex-grow-1">

                      <h6 class="mb-1 document-name"
                          style="color:${cores.texto};">
                        ${file.name}
                      </h6>

                      <small class="text-uppercase font-weight-bold"
                             style="
                                letter-spacing:0.5px;
                                font-size:0.7rem;
                                color:${cores.verdeEscuro};
                             ">
                        ${file.ext} Documento
                      </small>

                    </div>

                    <div class="ml-3 download-icon"
                         style="color:${cores.verde};">

                      <i class="fas fa-download"></i>

                    </div>

                  </a>

                `).join('')}

              </div>

            </div>

          </div>

        </div>
      `;
    });

    newHtml += '</div>';

    container.innerHTML = newHtml;

    // ESTILOS DOS BOTÕES
    const style = document.createElement('style');

    style.innerHTML = `
      .btn-prefeitura{
        background:${cores.verde};
        color:#fff;
        border:1px solid ${cores.verde};
        font-weight:600;
      }

      .btn-prefeitura:hover{
        background:${cores.verdeEscuro};
        border-color:${cores.verdeEscuro};
        color:#fff;
      }

      .btn-outline-prefeitura{
        background:#fff;
        color:${cores.verdeEscuro};
        border:1px solid ${cores.verde};
        font-weight:600;
      }

      .btn-outline-prefeitura:hover{
        background:${cores.verdeClaro};
        color:${cores.verdeEscuro};
        border-color:${cores.verdeEscuro};
      }

      .modern-file-item:hover{
        background:#f7faf7;
        border-left-color:${cores.verde};
      }

      .modern-file-item:hover .document-name{
        color:${cores.verdeEscuro} !important;
      }

      .modern-file-item:hover .download-icon{
        color:${cores.verdeEscuro} !important;
      }

      .modern-file-item:hover .icon-wrapper{
        background:#dff0df !important;
      }
    `;

    document.head.appendChild(style);

    // FILTRO
    const filterButtons = document.querySelectorAll('.btn-filter-year');

    function applyFilter(selectedYear, targetButton) {

      filterButtons.forEach(b => {
        b.classList.remove('btn-prefeitura', 'active');
        b.classList.add('btn-outline-prefeitura');
      });

      targetButton.classList.remove('btn-outline-prefeitura');
      targetButton.classList.add('btn-prefeitura', 'active');

      document.querySelectorAll('.file-category-wrapper').forEach(item => {

        if (
          selectedYear === 'all' ||
          item.getAttribute('data-year') === selectedYear
        ) {
          item.style.display = 'flex';
          item.style.flexDirection = 'column';
        } else {
          item.style.display = 'none';
        }

      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        applyFilter(this.getAttribute('data-year'), this);
      });
    });

    // AUTO SELEÇÃO MAIOR ANO
    if (years.length > 0) {

      const maxYear = years[0];

      const maxYearButton = document.querySelector(
        `.btn-filter-year[data-year="${maxYear}"]`
      );

      if (maxYearButton) {
        applyFilter(maxYear, maxYearButton);
      }
    }
  }

  // ÍCONES
  function getFileIcon(ext) {

    switch (ext) {

      case 'pdf':
        return 'far fa-file-pdf text-danger';

      case 'doc':
      case 'docx':
        return 'far fa-file-word';

      case 'xls':
      case 'xlsx':
        return 'far fa-file-excel';

      default:
        return 'far fa-file-alt';
    }
  }

  // OBSERVER
  const observer = new MutationObserver((mutations) => {

    mutations.forEach((mutation) => {

      if (mutation.addedNodes.length) {
        restyleFiles();
      }

    });
  });

  const target = document.querySelector('.spweb-file');

  if (target) {

    observer.observe(target, {
      childList: true,
      subtree: true
    });

    restyleFiles();
  }

});