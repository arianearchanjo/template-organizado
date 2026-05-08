class MeuFooter extends HTMLElement {
  connectedCallback() {
    const base = typeof getBasePath === 'function' ? getBasePath() : "";
    this.innerHTML = `
      <footer id="pi-footer">
        <div class="container">
          <div class="row">

            <!-- ===== COLUNA 1: LOGO + DESCRIÇÃO + SOBRE CAMPINA ===== -->
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="d-flex align-items-center mb-3">
                <a href="${base}pages/home/index.html" class="logo-wrapper" aria-label="Página inicial">
                  <img class="logo-img"
                       src="${base}_global/img/global/logo.png"
                       alt="Prefeitura de Campina Grande do Sul – Paraná"
                       style="height:50px;">
                </a>
              </div>

              <p class="footer-institutional-text" style="font-size:0.75rem;">
                Município do estado do Paraná, na Região Metropolitana de Curitiba.
              </p>

              <nav aria-label="Sobre o Município" class="mt-3">
                <h6>SOBRE CAMPINA</h6>
                <ul>
                  <li><a href="https://campinagrandedosul.pr.gov.br/historia-do-municipio">História do Município</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/dados-municipais">Dados Municipais</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/mapa-turismo">Mapa do Turismo</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/campina-grande-do-sul">Conheça Campina</a></li>
                </ul>
              </nav>
            </div>

            <!-- ===== COLUNA 2: SERVIÇOS + PREFEITURA ===== -->
            <div class="col-md-3 col-sm-6 mb-4">

              <nav aria-label="Serviços Municipais">
                <h6>SERVIÇOS</h6>
                <ul>
                  <li><a href="${base}pages/servico/index.html">Consulta de Débitos</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/emissao-da-nota-fiscal-de-servicos">Nota Fiscal de Serviços</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/licitacoes">Licitações</a></li>
                  <li><a href="${base}pages/portal-servicos/index.html">Todos os Serviços</a></li>
                </ul>
              </nav>

              <nav aria-label="Prefeitura" class="mt-3">
                <h6>PREFEITURA</h6>
                <ul>
                  <li><a href="${base}pages/prefeito/index.html">Prefeito</a></li>
                  <li><a href="${base}pages/secretarios-municipais/index.html">Secretários</a></li>
                  <li><a href="${base}pages/ouvidoria/index.html">Ouvidoria</a></li>
                </ul>
              </nav>

            </div>

            <!-- ===== COLUNA 3: TRANSPARÊNCIA + OUTRAS ENTIDADES ===== -->
            <div class="col-md-3 col-sm-6 mb-4">

              <nav aria-label="Transparência">
                <h6>TRANSPARÊNCIA</h6>
                <ul>
                  <li><a href="${base}pages/transparencia/index.html">Portal da Transparência</a></li>
                  <li><a href="${base}pages/e-sic/index.html">Acesso à Informação</a></li>
                  <li><a href="${base}pages/politica-privacidade/index.html">Política de Privacidade</a></li>
                  <li><a href="${base}pages/mapa-site/index.html">Mapa do Site</a></li>
                </ul>
              </nav>

              <nav aria-label="Outras Entidades" class="mt-3">
                <h6>OUTRAS ENTIDADES</h6>
                <ul>
                  <li><a href="https://campinagrandedosul.pr.gov.br/previcamp" target="_blank" rel="noopener noreferrer">PREVICAMP</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/fascamp" target="_blank" rel="noopener noreferrer">FASCAMP</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/assercamp" target="_blank" rel="noopener noreferrer">ASSERCAMP</a></li>
                  <li><a href="https://campinagrandedosul.pr.gov.br/camara-municipal" target="_blank" rel="noopener noreferrer">Câmara Municipal</a></li>
                </ul>
              </nav>

            </div>

            <!-- ===== COLUNA 4: CONTATO + REDES SOCIAIS ===== -->
            <div class="col-md-3 col-sm-6 mb-4">

              <h6>CONTATO</h6>
              <address class="footer-contact" aria-label="Informações de contato da Prefeitura" style="font-style:normal;">

                <p>
                  <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  Praça Bento Munhoz, 30 – Centro<br>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Campina Grande do Sul – PR
                </p>

                <p>
                  <i class="fas fa-phone" aria-hidden="true"></i>
                  <a href="tel:+554131627000" style="color:rgba(255,255,255,.6);">(41) 3162-7000</a>
                </p>

                <p>
                  <i class="fas fa-envelope" aria-hidden="true"></i>
                  <a href="mailto:faleconosco@pmcgs.pr.gov.br" style="color:rgba(255,255,255,.6);">faleconosco@pmcgs.pr.gov.br</a>
                </p>

                <p>
                  <i class="fas fa-clock" aria-hidden="true"></i>
                  <strong>Seg. a Sex.</strong> – 8h30–12h / 13h30–17h30
                </p>

              </address>

              <h6 class="mt-3">REDES SOCIAIS</h6>
              <div style="display:flex;gap:10px;flex-wrap:wrap;" aria-label="Redes sociais da Prefeitura">
                <a href="https://www.facebook.com/PrefDeCampina"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="Facebook da Prefeitura"
                   style="color:rgba(255,255,255,.6);font-size:20px;">
                  <i class="fab fa-facebook-f" aria-hidden="true"></i>
                </a>
                <a href="https://www.instagram.com/prefdecampina"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="Instagram da Prefeitura"
                   style="color:rgba(255,255,255,.6);font-size:20px;">
                  <i class="fab fa-instagram" aria-hidden="true"></i>
                </a>
                <a href="https://www.youtube.com/@prefdecampina"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="YouTube da Prefeitura"
                   style="color:rgba(255,255,255,.6);font-size:20px;">
                  <i class="fab fa-youtube" aria-hidden="true"></i>
                </a>
                <a href="https://campinagrandedosul.pr.gov.br/whatsapp"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="WhatsApp da Prefeitura"
                   style="color:rgba(255,255,255,.6);font-size:20px;">
                  <i class="fab fa-whatsapp" aria-hidden="true"></i>
                </a>
              </div>

            </div>
          </div>

          <!-- ===== FOOTER BOTTOM ===== -->
          <div class="footer-bottom" style="border-top: 1px solid rgba(255,255,255,.12); margin-top: 28px; padding-top: 16px; font-size: 0.6875rem; color: rgba(255,255,255,.35); text-align: center;">
            &copy; 2026 Prefeitura Municipal de Campina Grande do Sul – PR &nbsp;|&nbsp;
            <a href="${base}pages/politica-privacidade/index.html" style="color: rgba(255,255,255,.35); text-decoration: none;">Política de Privacidade e</a> 
            <a href="${base}pages/preferencias-cookies/index.html" style="color: rgba(255,255,255,.35); text-decoration: none;">Preferências de Cookies</a> &nbsp;|&nbsp;
            Mantido pela STI – Secretaria de Tecnologia da Informação
          </div>

        </div>
      </footer>
    `;
  }
}

// Define o nome da nova tag
customElements.define('meu-footer', MeuFooter);
