/**
 * portal-servicos.js — Página Portal de Serviços
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Módulos:
 *   1. Base de dados dos serviços
 *   2. Estado dos filtros ativos
 *   3. Renderização dos cards
 *   4. Lógica de filtragem e busca
 *   5. Eventos dos filtros
 *   6. Eventos da barra de pesquisa
 *   7. Inicialização
 *
 * Acessibilidade (Fonte, Contraste, Atalhos, TTS, VLibras) agora é gerenciada 
 * centralmente por _global/js/acessibilidade-component.js
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     1. BASE DE DADOS DOS SERVIÇOS
     Cada objeto representa um serviço municipal.
  ════════════════════════════════════════════════════════════════════════ */

  var SERVICOS = [
    {
      id: 1,
      nome: 'Acesso a Atoteca',
      descricao: 'Acesso ao sistema administrativo Atoteca para gestão de documentos municipais.',
      atendimento: 'online',
      publico: 'servidor',
      link: 'https://campinagrandedosul.pr.gov.br/atoteca'
    },
    {
      id: 2,
      nome: 'Consulta de Débitos',
      descricao: 'Consulte débitos de IPTU, ISS, taxas e outros tributos municipais.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-de-debitos'
    },
    {
      id: 3,
      nome: 'Emissão de Certidão de Débitos',
      descricao: 'Emita a certidão negativa ou positiva de débitos municipais online.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/emissao-da-certidao-de-debitos'
    },
    {
      id: 4,
      nome: 'Emissão de Nota Fiscal de Serviços',
      descricao: 'Emita notas fiscais de serviços eletrônicas (NFS-e) pelo portal do prestador.',
      atendimento: 'online',
      publico: 'empresa',
      link: 'https://campinagrandedosul.pr.gov.br/emissao-da-nota-fiscal-de-servicos'
    },
    {
      id: 5,
      nome: 'Consulta de Processos',
      descricao: 'Acompanhe o andamento de processos protocolados na Prefeitura.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-de-processos'
    },
    {
      id: 6,
      nome: 'Ouvidoria',
      descricao: 'Registre reclamações, sugestões, elogios ou denúncias ao município.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/ouvidoria'
    },
    {
      id: 7,
      nome: 'Licença para Funcionamento',
      descricao: 'Solicite ou renove o Alvará de Funcionamento para estabelecimentos comerciais.',
      atendimento: 'presencial',
      publico: 'empresa',
      link: 'https://campinagrandedosul.pr.gov.br/licenca-para-funcionamento'
    },
    {
      id: 8,
      nome: 'Acesso à Informação (e-SIC)',
      descricao: 'Solicite informações públicas por meio do Sistema Eletrônico do Serviço de Informações ao Cidadão.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/esic'
    },
    {
      id: 9,
      nome: 'Licitações e Contratos',
      descricao: 'Acompanhe editais, resultados e atas de licitações e contratos do município.',
      atendimento: 'online',
      publico: 'empresa',
      link: 'https://campinagrandedosul.pr.gov.br/licitacoes'
    },
    {
      id: 10,
      nome: 'Portal da Transparência',
      descricao: 'Acesse receitas, despesas, folha de pagamento e demais dados financeiros do município.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/'
    },
    {
      id: 11,
      nome: 'Holerite do Servidor',
      descricao: 'Acesse seus contracheques e comprovantes de rendimentos pelo portal do servidor.',
      atendimento: 'online',
      publico: 'servidor',
      link: 'https://campinagrandedosul.pr.gov.br/holerite'
    },
    {
      id: 12,
      nome: 'Protocolo de Documentos',
      descricao: 'Protocole documentos, requerimentos e petições junto à Prefeitura.',
      atendimento: 'presencial',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/protocolo'
    },
    {
      id: 13,
      nome: 'Habite-se e Alvará de Construção',
      descricao: 'Solicite aprovação de projetos, alvarás de construção e Certificado de Habite-se.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/habite-se'
    },
    {
      id: 14,
      nome: 'Consulta de Legislação Municipal',
      descricao: 'Pesquise leis, decretos, portarias e atos normativos do município.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-legislacao-municipal'
    },
    {
      id: 15,
      nome: 'Matrícula Escolar Municipal',
      descricao: 'Realize a matrícula de alunos nas escolas e creches da rede municipal de ensino.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/matricula-escolar'
    },
    {
      id: 16,
      nome: 'Agendamento de Serviços de Saúde',
      descricao: 'Agende consultas, exames e procedimentos nas unidades de saúde do município.',
      atendimento: 'hibrido',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/agendamento-saude'
    },
    {
      id: 17,
      nome: 'PGDI — Plano de Gestão do Desempenho',
      descricao: 'Acesse e registre as avaliações de desempenho individuais dos servidores municipais.',
      atendimento: 'online',
      publico: 'servidor',
      link: 'https://campinagrandedosul.pr.gov.br/pgdi'
    },
    {
      id: 18,
      nome: 'Endereços e Telefones Municipais',
      descricao: 'Consulte endereços, telefones e horários de atendimento das secretarias e órgãos municipais.',
      atendimento: 'online',
      publico: 'cidadao',
      link: 'https://campinagrandedosul.pr.gov.br/consulta-enderecos'
    }
  ];


  /* ══════════════════════════════════════════════════════════════════════
     2. ESTADO DOS FILTROS ATIVOS
  ════════════════════════════════════════════════════════════════════════ */

  var estado = {
    busca:       '',       
    publico:     'todos',  
    atendimento: 'todos'   
  };


  /* ══════════════════════════════════════════════════════════════════════
     3. RENDERIZAÇÃO DOS CARDS
  ════════════════════════════════════════════════════════════════════════ */

  function obterTag(atendimento) {
    switch (atendimento) {
      case 'online':     return { classe: 'tag-online',     rotulo: 'Online' };
      case 'presencial': return { classe: 'tag-presencial', rotulo: 'Presencial' };
      case 'hibrido':    return { classe: 'tag-hibrido',    rotulo: 'Híbrido' };
      default:           return { classe: 'tag-online',     rotulo: atendimento };
    }
  }

  function criarCard(servico) {
    var tag = obterTag(servico.atendimento);

    var article = document.createElement('article');
    article.className  = 'servico-card';
    article.setAttribute('role', 'listitem');
    article.setAttribute('data-publico',     servico.publico);
    article.setAttribute('data-atendimento', servico.atendimento);
    article.setAttribute('data-nome',        servico.nome.toLowerCase());

    article.innerHTML =
      '<span class="' + tag.classe + '">' + tag.rotulo + '</span>' +
      '<h3>' + servico.nome + '</h3>' +
      '<p>' + servico.descricao + '</p>' +
      '<a class="btn-servico" href="' + servico.link + '"' +
         ' aria-label="Iniciar: ' + servico.nome + '">' +
        '<i class="fas fa-arrow-right" aria-hidden="true"></i>' +
        ' Iniciar' +
      '</a>';

    return article;
  }

  function renderizarTodos() {
    var lista = document.getElementById('ps-lista');
    if (!lista) return;

    var fragment = document.createDocumentFragment();
    SERVICOS.forEach(function (s) {
      fragment.appendChild(criarCard(s));
    });
    lista.appendChild(fragment);
  }


  /* ══════════════════════════════════════════════════════════════════════
     4. LÓGICA DE FILTRAGEM E BUSCA
  ════════════════════════════════════════════════════════════════════════ */

  function filtrar() {
    var lista    = document.getElementById('ps-lista');
    var contador = document.getElementById('ps-num-resultados');
    var semRes   = document.getElementById('ps-sem-resultado');

    if (!lista) return;

    var cards    = lista.querySelectorAll('.servico-card');
    var termoRaw = estado.busca.trim();
    var termo = normalizar(termoRaw);
    var visiveis = 0;

    cards.forEach(function (card) {
      var pubCard  = card.getAttribute('data-publico');
      var atenCard = card.getAttribute('data-atendimento');
      var nomeCard = normalizar(card.getAttribute('data-nome'));

      var passaPublico     = (estado.publico     === 'todos' || pubCard  === estado.publico);
      var passaAtendimento = (estado.atendimento === 'todos' || atenCard === estado.atendimento);
      var passaBusca       = (termo === '' || nomeCard.indexOf(termo) !== -1);

      if (passaPublico && passaAtendimento && passaBusca) {
        card.style.display = '';
        visiveis++;
      } else {
        card.style.display = 'none';
      }
    });

    if (contador) contador.textContent = visiveis;
    if (semRes) {
      semRes.style.display = (visiveis === 0) ? '' : 'none';
    }
  }

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }


  /* ══════════════════════════════════════════════════════════════════════
     5. EVENTOS DOS FILTROS
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarFiltros() {
    var botoes = document.querySelectorAll('.ps-filtro-btn');

    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var grupo = btn.getAttribute('data-filtro');  
        var valor = btn.getAttribute('data-valor');   

        var gruposBotoes = document.querySelectorAll('[data-filtro="' + grupo + '"]');
        gruposBotoes.forEach(function (b) {
          b.classList.remove('ativo');
          b.setAttribute('aria-pressed', 'false');
        });

        btn.classList.add('ativo');
        btn.setAttribute('aria-pressed', 'true');
        estado[grupo] = valor;
        filtrar();
      });
    });

    var btnLimpar = document.getElementById('ps-btn-limpar-filtros');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', limparFiltros);
    }

    var btnLimparVazio = document.getElementById('ps-btn-limpar-filtros-vazio');
    if (btnLimparVazio) {
      btnLimparVazio.addEventListener('click', limparFiltros);
    }
  }

  function limparFiltros() {
    estado.publico     = 'todos';
    estado.atendimento = 'todos';
    estado.busca       = '';

    var botoes = document.querySelectorAll('.ps-filtro-btn');
    botoes.forEach(function (btn) {
      var ativo = btn.getAttribute('data-valor') === 'todos';
      btn.classList.toggle('ativo', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    var inputBusca = document.getElementById('ps-busca');
    if (inputBusca) {
      inputBusca.value = '';
    }

    var btnX = document.getElementById('ps-btn-limpar');
    if (btnX) btnX.style.display = 'none';

    filtrar();
  }


  /* ══════════════════════════════════════════════════════════════════════
     6. EVENTOS DA BARRA DE PESQUISA
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarBusca() {
    var inputBusca = document.getElementById('ps-busca');
    var btnX       = document.getElementById('ps-btn-limpar');

    if (!inputBusca) return;

    inputBusca.addEventListener('input', function () {
      estado.busca = inputBusca.value;
      if (btnX) {
        btnX.style.display = inputBusca.value.length > 0 ? '' : 'none';
      }
      filtrar();
    });

    if (btnX) {
      btnX.addEventListener('click', function () {
        inputBusca.value = '';
        estado.busca     = '';
        btnX.style.display = 'none';
        inputBusca.focus();
        filtrar();
      });
    }
  }


  /* ══════════════════════════════════════════════════════════════════════
     7. INICIALIZAÇÃO
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    renderizarTodos();
    inicializarFiltros();
    inicializarBusca();
    filtrar();
  });

})();
