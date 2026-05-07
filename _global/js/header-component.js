class MeuHeader extends HTMLElement {
  connectedCallback() {
    const base = typeof getBasePath === 'function' ? getBasePath() : "";
    this.innerHTML = `
        <nav id="pi-navbar" class="navbar navbar-expand-lg navbar-main" aria-label="Menu principal">
    <div class="container">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Abrir menu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav ml-auto">

          <li class="nav-item">
            <a class="nav-link" href="https://campinagrandedosul.pr.gov.br/noticias">NOTÍCIAS</a>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">SERVIÇOS</a>
            <div class="dropdown-menu">
              <div class="dropdown-group-title">Tributos</div>
              <a class="dropdown-item" href="${base}pages/servico/index.html">Consulta de Débitos</a>
              <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/emissao-da-certidao-de-debitos">Certidão de Débitos</a>
              <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/emissao-da-nota-fiscal-de-servicos">Nota Fiscal de Serviços</a>
              <div class="dropdown-group-title">Protocolo</div>
              <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/consulta-de-processos">Consulta de Processos</a>
              <a class="dropdown-item" href="${base}pages/ouvidoria/index.html">Ouvidoria</a>
              <a class="dropdown-item" href="${base}pages/e-sic/index.html">Acesso à Informação</a>
              <div class="dropdown-group-title">Diversos</div>
              <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/licitacoes">Licitações</a>
              <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/consulta-enderecos">Endereços e Telefones</a>
              <a class="dropdown-item" href="${base}pages/portal-servicos/index.html" style="color:var(--verde);font-weight:700;">→ Mais Serviços</a>
            </div>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">PREFEITURA</a>
            <div class="dropdown-menu mega-menu">
              <div class="mega-col">
                <div class="dropdown-group-title">Secretarias</div>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/administracao">Administração</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/cultura">Cultura</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/desenvolvimento-economico">Desenvolvimento Econômico</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/desenvolvimento-social">Desenvolvimento Social</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/desenvolvimento-sustentavel">Desenvolvimento Sustentável</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/educacao">Educação</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/governo-assuntos-juridicos">Governo e Assuntos Jurídicos</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/infraestrutura">Infraestrutura</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/mulher">Mulher e Igualdade Racial</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/ordem-publica">Ordem Pública e Segurança</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/saude">Saúde</a>
                <a class="dropdown-item" href="${base}pages/secretarias/index.html">Tecnologia da Informação</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/urbanismo">Urbanismo</a>
              </div>
              <div class="mega-col">
                <div class="dropdown-group-title">Outros Órgãos</div>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/controladoria-geral">Controladoria Geral</a>
                <a class="dropdown-item" href="${base}pages/ouvidoria/index.html">Ouvidoria Geral</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/procuradoria-geral">Procuradoria Geral</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/conselhos-municipais">Conselhos Municipais</a>
                <div class="dropdown-group-title" style="margin-top:14px;">Gestão</div>
                  <a class="dropdown-item" href="${base}pages/prefeito/index.html">Prefeito</a>
                  <a class="dropdown-item" href="${base}pages/vice-prefeito/index.html">Vice-Prefeito</a>
                  <a class="dropdown-item" href="${base}pages/secretarios-municipais/index.html">Secretários Municipais</a>
              </div>
            </div>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">TRANSPARÊNCIA</a>
            <div class="dropdown-menu mega-menu">
              <div class="mega-col">
                <div class="dropdown-group-title">Pessoal</div>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/servidores">Servidores</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/concursos">Concursos</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/diarias">Diárias</a>
                <div class="dropdown-group-title" style="margin-top:14px;">Financeiro</div>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/licitacoes">Licitações</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/contratos">Contratos</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/convenios">Convênios</a>
                <a class="dropdown-item" href="https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/" target="_blank" rel="noopener">PPA / LDO / LOA</a>
                <a class="dropdown-item" href="https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/" target="_blank" rel="noopener">Emendas Parlamentares</a>
                <a class="dropdown-item" href="https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/obraspublicas" target="_blank" rel="noopener">Obras Públicas</a>
              </div>
              <div class="mega-col">
                <div class="dropdown-group-title">Legislação e Informação</div>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/consulta-legislacao-municipal">Legislação Municipal</a>
                <a class="dropdown-item" href="https://campinagrandedosul.pr.gov.br/lista-espera-cmeis">Lista de Espera – CMEIs</a>
                <a class="dropdown-item" href="${base}pages/perguntas-frequentes/index.html">Perguntas e Respostas</a>
                <a class="dropdown-item" href="${base}pages/e-sic/index.html">Acesso à Informação</a>
                <a class="dropdown-item" href="https://radardatransparencia.atricon.org.br/" target="_blank" rel="noopener">Radar da Transparência</a>
                <a class="dropdown-item" href="${base}pages/transparencia/index.html" style="color:var(--verde);font-weight:700;">→ Portal da Transparência</a>
              </div>
            </div>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="${base}pages/conheca-campina/index.html">CONHEÇA CAMPINA</a>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="${base}pages/ouvidoria/index.html" style="color:#ffe066 !important;font-weight:700;white-space:nowrap;">OUVIDORIA</a>
          </li>

        </ul>
      </div>
    </div>
  </nav>
    `;
  }
}

customElements.define('meu-header', MeuHeader);
