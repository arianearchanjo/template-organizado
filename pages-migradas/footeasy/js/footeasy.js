/* JS for FootEasy page */
window.iniciarCardsRotativos = function (config) {
    var seletor = config.seletor;
    var rotulo = config.rotulo || "Em destaque";
    var icone = config.icone || "fas fa-star";
    var itens = config.itens || [];
    var tempo = config.tempo || 5000;
    var classeCard = config.classeCard || "card-rotativo";

    if (!seletor) return;

    var wrapper = document.querySelector(seletor);
    if (!wrapper) return;

    if (wrapper.getAttribute("data-cards-rotativos-pronto") === "true") return;
    wrapper.setAttribute("data-cards-rotativos-pronto", "true");

    if (!itens || !itens.length) {
        wrapper.innerHTML = '<p class="card-rotativo-vazio">Nenhum item disponível no momento.</p>';
        return;
    }

    var indice = 0;
    var timeout = null;

    function renderizar() {
        var item = itens[indice];
        wrapper.innerHTML = "";

        var card = document.createElement("div");
        card.className = classeCard;

        var cabecalho = document.createElement("div");
        cabecalho.className = "card-rotativo-cabecalho";

        var iconeEl = document.createElement("i");
        iconeEl.className = icone;
        iconeEl.setAttribute("aria-hidden", "true");

        var rotuloEl = document.createElement("span");
        rotuloEl.className = "card-rotativo-rotulo";
        rotuloEl.textContent = rotulo;

        cabecalho.appendChild(iconeEl);
        cabecalho.appendChild(rotuloEl);
        card.appendChild(cabecalho);

        var corpo = document.createElement("div");
        corpo.className = "card-rotativo-corpo";
        corpo.innerHTML = item.html || "";
        card.appendChild(corpo);

        wrapper.appendChild(card);
    }

    function proximo() {
        indice = (indice + 1) % itens.length;
        renderizar();
        timeout = setTimeout(proximo, tempo);
    }

    renderizar();
    timeout = setTimeout(proximo, tempo);
};

document.addEventListener('DOMContentLoaded', function () {
    carregarEstatisticas();
    iniciarCardPartidas();
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

function iniciarCardPartidas() {
    if (!window.iniciarCardsRotativos) return;

    var partidas = [
        { rotulo: 'Final da Copa Campina 2026', html: '<p><strong>Final da Copa Campina 2026</strong><br>Equipe A x Equipe B<br><small>Sábado — 15:00 — Estádio Municipal</small></p>' },
        { rotulo: 'Semifinal', html: '<p><strong>Semifinal</strong><br>Equipe C x Equipe D<br><small>Domingo — 10:00 — Estádio Municipal</small></p>' },
        { rotulo: 'Quartas de final', html: '<p><strong>Quartas de final</strong><br>Equipe E x Equipe F<br><small>Sexta-feira — 19:00 — Ginásio de Esportes</small></p>' }
    ];

    window.iniciarCardsRotativos({
        seletor: '#footeasy-partidas-destaque',
        rotulo: 'Próxima partida',
        icone: 'fas fa-futbol',
        classeCard: 'footeasy-card-rotativo',
        tempo: 6000,
        itens: partidas
    });
}
