// component/search-component.js
class MeuSearch extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initVisualToggle();
  }

  render() {
    const base = typeof getBasePath === 'function' ? getBasePath() : "";
    this.innerHTML = `
      <style>
        .search-container { position: relative; width: 100%; }

        #main-search-input:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: var(--verde, #2d7a2d) !important;
        }
        
        /* ════════════════════════════════════════════════════════════
           AUTOCOMPLETE - ESTILOS VISUAIS (FRONT-END)
           ════════════════════════════════════════════════════════════ */
        .search-autocomplete {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1.5px solid #c8d8c8;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 9000;
          margin-top: 5px;
          display: none; /* Escondido por padrão, aparece ao digitar */
          max-height: 450px;
          overflow-y: auto;
        }
        
        .search-autocomplete.show { display: block; }

        .search-group-header {
          font-size: 0.625rem;
          color: var(--verde, #2d7a2d);
          text-transform: uppercase;
          font-weight: 700;
          padding: 12px 16px 4px;
          letter-spacing: 0.5px;
          background: #f9fbf9;
        }

        .search-item {
          padding: 10px 16px;
          font-size: 0.8125rem;
          color: #333;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .search-item:last-child { border-bottom: none; }

        .search-item i { width: 16px; text-align: center; }
        .search-item i.fa-th-large { color: #2d7a2d; }
        .search-item i.fa-file-alt { color: #777; }
        .search-item i.fa-building { color: #1e5c1e; }
        .search-item i.fa-users { color: #2d7a2d; }

        .search-item:hover, .search-item.active {
          background: #e8f5e8;
          color: #1e5c1e;
          text-decoration: none;
        }
        
        .search-item strong { font-weight: 700; color: #000; }

        /* Alto Contraste */
        body.high-contrast .search-autocomplete { background: #000; border-color: #fff; }
        body.high-contrast .search-group-header { background: #111; color: #ffff00; }
        body.high-contrast .search-item { color: #fff; border-color: #444; }
        body.high-contrast .search-item:hover { background: #333; color: #ffff00; }
      </style>

      <header id="header" style="background: #fff; border-bottom: 1px solid #eee; padding: 15px 0; display: block !important;">
        <div class="container">
          <div class="row align-items-center" style="display: flex; flex-wrap: wrap;">
            <div class="col-md-4">
              <a href="${base}pages/home/index.html">
                <img src="${base}_global/img/global/logo.png" style="max-width: 250px;">
              </a>
            </div>
            <div class="col-md-8">
              <div class="search-container">
                <form action="#" class="input-group">
                  <input type="text" class="form-control" placeholder="O que você procura?" 
                         id="main-search-input" autocomplete="off">
                  <div class="input-group-append">
                    <button type="submit" class="btn btn-success"><i class="fas fa-search"></i></button>
                  </div>
                </form>
                
                <!-- DROPDOWN ESTRUTURAL (EXEMPLO DE FRONT-END) -->
                <div class="search-autocomplete" id="search-results">
                  <div class="search-group-header">Serviços</div>
                  <a href="#" class="search-item">
                    <i class="fas fa-th-large"></i>
                    <span>Emissão de <strong>IPTU</strong></span>
                  </a>
                  <a href="#" class="search-item">
                    <i class="fas fa-th-large"></i>
                    <span>Nota Fiscal Eletrônica</span>
                  </a>
                  
                  <div class="search-group-header">Secretarias</div>
                  <a href="#" class="search-item">
                    <i class="fas fa-building"></i>
                    <span>Secretaria de <strong>Saúde</strong></span>
                  </a>
                  
                  <div class="search-group-header">Páginas</div>
                  <a href="#" class="search-item">
                    <i class="fas fa-file-alt"></i>
                    <span>Perguntas Frequentes</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  initVisualToggle() {
    const input = this.querySelector('#main-search-input');
    const dropdown = this.querySelector('#search-results');

    // Simulação visual: mostra o dropdown ao digitar algo
    input.addEventListener('input', (e) => {
      if (e.target.value.length >= 2) {
        dropdown.classList.add('show');
      } else {
        dropdown.classList.remove('show');
      }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }
}

if (!customElements.get('meu-search')) {
  customElements.define('meu-search', MeuSearch);
}

