/* JS for FootEasy page */

(function () {
  "use strict";

  var PROCESSADO = "data-carrossel-pronto";

  function prefixoClasseAtiva(wrapper) {
    var classes = wrapper.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf("carrossel") !== -1 && classes[i].indexOf("--") === -1) {
        return classes[i] + "--ativo";
      }
    }
    return null;
  }

  function criarNavegacao(wrapper) {
    var nav = document.createElement("div");
    nav.className = "pi-carrossel-nav";
    nav.setAttribute("aria-label", "Navegação do carrossel");

    var anterior = document.createElement("button");
    anterior.type = "button";
    anterior.className = "pi-carrossel-btn pi-carrossel-btn--prev";
    anterior.setAttribute("aria-label", "Mostrar cards anteriores");
    anterior.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';

    var proximo = document.createElement("button");
    proximo.type = "button";
    proximo.className = "pi-carrossel-btn pi-carrossel-btn--next";
    proximo.setAttribute("aria-label", "Mostrar próximos cards");
    proximo.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';

    nav.appendChild(anterior);
    nav.appendChild(proximo);

    wrapper.appendChild(nav);
    return nav;
  }

  function larguraPasso(track) {
    var primeiro = track.children[0];
    if (!primeiro) return 0;
    var estilo = window.getComputedStyle(primeiro);
    var margem = parseFloat(estilo.marginRight) || 0;
    return primeiro.getBoundingClientRect().width + margem;
  }

  function QUANTIDADE_VISIVEL() {
    return 2;
  }

  function dimensionar(wrapper, track) {
    var itens = track.children;
    if (!itens.length) return;
    var viewport = wrapper.clientWidth;
    var estilo = window.getComputedStyle(itens[0]);
    var gap = parseFloat(estilo.marginRight) || 0;
    var cardWidth = (viewport - gap) / QUANTIDADE_VISIVEL();
    if (cardWidth <= 0) return;
    for (var i = 0; i < itens.length; i++) {
      itens[i].style.width = cardWidth + "px";
    }
  }

  function iniciar(wrapper) {
    var track = wrapper.querySelector("[data-carrossel-track]");
    var ativa = prefixoClasseAtiva(wrapper);
    if (!track || !ativa || wrapper.hasAttribute(PROCESSADO)) return;

    wrapper.setAttribute(PROCESSADO, "footeasy");

    var indice = 0;
    var nav = criarNavegacao(wrapper);
    var anterior = nav.querySelector(".pi-carrossel-btn--prev");
    var proximo = nav.querySelector(".pi-carrossel-btn--next");

    function totalItems() {
      return track.children.length;
    }

    function maximoIndice() {
      return Math.max(0, totalItems() - QUANTIDADE_VISIVEL());
    }

    function aplicar() {
      var deslocamento = indice * larguraPasso(track);
      track.style.transform = "translateX(-" + deslocamento + "px)";
    }

    function atualizar() {
      if (totalItems() <= QUANTIDADE_VISIVEL()) {
        track.style.transform = "translateX(0)";
        anterior.disabled = true;
        proximo.disabled = true;
        return;
      }
      var max = maximoIndice();
      if (indice > max) indice = max;
      aplicar();
      anterior.disabled = false;
      proximo.disabled = false;
    }

    anterior.addEventListener("click", function () {
      if (totalItems() <= QUANTIDADE_VISIVEL()) return;
      indice = (indice <= 0) ? maximoIndice() : indice - 1;
      aplicar();
    });

    proximo.addEventListener("click", function () {
      if (totalItems() <= QUANTIDADE_VISIVEL()) return;
      indice = (indice >= maximoIndice()) ? 0 : indice + 1;
      aplicar();
    });

    function redimensionar() {
      dimensionar(wrapper, track);
      atualizar();
    }

    window.addEventListener("resize", redimensionar);

    wrapper.classList.add(ativa);
    redimensionar();
  }

  function escanear(raiz) {
    var local = raiz && raiz.querySelectorAll ? raiz : document;
    var dentro = local.querySelectorAll ? local.querySelectorAll("[data-carrossel]") : [];
    for (var i = 0; i < dentro.length; i++) iniciar(dentro[i]);

    if (raiz && raiz.nodeType === 1 && raiz.matches && raiz.matches("[data-carrossel]")) {
      iniciar(raiz);
    }
  }

  function aoAdicionar(mutacoes) {
    for (var m = 0; m < mutacoes.length; m++) {
      var added = mutacoes[m].addedNodes;
      for (var n = 0; n < added.length; n++) {
        var nodo = added[n];
        if (nodo.nodeType !== 1) continue;
        if (nodo.matches && nodo.matches("[data-carrossel]")) iniciar(nodo);
        escanear(nodo);
      }
    }
  }

  if (document.body) escanear(document);
  else document.addEventListener("DOMContentLoaded", function () { escanear(document); });

  if (window.MutationObserver) {
    var observer = new MutationObserver(aoAdicionar);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

document.addEventListener('DOMContentLoaded', function () {
    carregarEstatisticas();
    carregarPartidas();
});

async function carregarEstatisticas() {
    try {
        const response = await fetch('https://futebol.pmcgs.pr.gov.br/api/public/statistics');
        if (!response.ok) throw new Error('Erro HTTP ' + response.status);
        const dados = await response.json();

        const campos = {
            'total-jogadores': { valor: dados.jogadoresRegistrados, label: 'jogadores registrados' },
            'total-equipes': { valor: dados.equipesCadastradas, label: 'equipes cadastradas' },
            'total-partidas': { valor: dados.partidasGerenciadas, label: 'partidas gerenciadas' },
            'total-campeonatos': { valor: dados.campeonatosNaPlataforma, label: 'campeonatos na plataforma' },
            'total-rodadas': { valor: dados.rodadasProgramadas, label: 'rodadas organizadas' },
            'total-presidentes': { valor: dados.presidentesCadastrados, label: 'presidentes de clubes' }
        };

        Object.entries(campos).forEach(function ([id, info]) {
            var el = document.getElementById(id);
            if (el && info.valor != null) {
                el.textContent = info.valor;
                el.setAttribute('aria-label', info.valor + ' ' + info.label);
            }
        });

        var elData = document.getElementById('pi-data-atualizacao');
        if (elData) {
            var agora = new Date();
            var dia = String(agora.getDate()).padStart(2, '0');
            var mes = String(agora.getMonth() + 1).padStart(2, '0');
            var ano = agora.getFullYear();
            var hora = String(agora.getHours()).padStart(2, '0');
            var min = String(agora.getMinutes()).padStart(2, '0');
            elData.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Atualizado em ' + dia + '/' + mes + '/' + ano + ' às ' + hora + ':' + min;
        }
    } catch (erro) {
        console.error('Não foi possível carregar as estatísticas do FootEasy:', erro);
    }
}

function escapeHtml(valor) {
    return String(valor == null ? '' : valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatarData(dataHora) {
    var data = new Date(dataHora);
    if (isNaN(data.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    }).format(data).replace(/^(\w)/, function (m) { return m.toUpperCase(); });
}

function montarPartidaItem(partida) {
    var nomeA = escapeHtml(partida.teamAName || 'Equipe A');
    var nomeB = escapeHtml(partida.teamBName || 'Equipe B');
    var campeonato = escapeHtml(partida.championshipName || 'Campeonato municipal');
    var quando = formatarData(partida.dataHora);

    var item = document.createElement('div');
    item.className = 'pi-partida-item';

    var duelo = document.createElement('span');
    duelo.className = 'pi-partida-duelo';
    duelo.textContent = nomeA + '  x  ' + nomeB;
    item.appendChild(duelo);

    var meta = document.createElement('span');
    meta.className = 'pi-partida-meta';
    meta.textContent = campeonato + (quando ? ' · ' + quando : '');
    item.appendChild(meta);

    return item;
}

async function carregarPartidas() {
    var wrapper = document.getElementById('footeasy-partidas-destaque');
    if (!wrapper) return;

    var loader = wrapper.querySelector('.pi-partidas-loader');
    if (loader) {
        loader.hidden = true;
    }

    try {
        var response = await fetch('https://futebol.pmcgs.pr.gov.br/api/public/next-match');
        if (!response.ok) throw new Error('Erro HTTP ' + response.status);
        var dados = await response.json();
        var lista = Array.isArray(dados) ? dados : (dados && Array.isArray(dados.data) ? dados.data : (dados ? [dados] : []));

        if (!lista.length) {
            wrapper.innerHTML = '<p class="pi-partidas-vazio">Nenhuma partida programada no momento.</p>';
            return;
        }

        wrapper.textContent = '';
        var limitadas = lista.slice(0, 3);
        var fragmento = document.createDocumentFragment();
        limitadas.forEach(function (partida) {
            fragmento.appendChild(montarPartidaItem(partida));
        });
        wrapper.appendChild(fragmento);
    } catch (erro) {
        console.error('Não foi possível carregar as próximas partidas do FootEasy:', erro);
        wrapper.innerHTML = '<p class="pi-partidas-vazio">Não foi possível carregar as partidas agora.</p>';
    }
}
