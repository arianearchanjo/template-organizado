/* JS for FootEasy page */
document.addEventListener('DOMContentLoaded', function () {
    carregarEstatisticas();
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
