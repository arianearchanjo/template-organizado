// ===== CONFIGURACAO =====
const CONFIG = {
  baseUrl: 'https://futebol.pmcgs.pr.gov.br/api/public/championship',
  championshipId: '66ab8c25-f144-485b-bcb7-783eed3bf982' // Inicial: Serie Ouro
};

const API = {
  info: () => `${CONFIG.baseUrl}/${CONFIG.championshipId}`,
  teams: () => `${CONFIG.baseUrl}/${CONFIG.championshipId}/teams`,
  standings: () => `${CONFIG.baseUrl}/${CONFIG.championshipId}/standings`,
  topScorers: () => `${CONFIG.baseUrl}/${CONFIG.championshipId}/top-scorers`,
  defense: () => `${CONFIG.baseUrl}/${CONFIG.championshipId}/defense`,
  matches: () => `${CONFIG.baseUrl}/${CONFIG.championshipId}/matches`,
};

// ===== STATE =====
let roundsData = [];
let currentRoundIdx = 0;
let apiCurrentRound = 1;

// ===== REFRESH DASHBOARD =====
function refreshDashboard() {
  const loadingHeader = document.getElementById('header-loading');
  const infoHeader = document.getElementById('header-info');
  
  if (loadingHeader) loadingHeader.style.display = 'block';
  if (infoHeader) infoHeader.style.display = 'none';
  
  loadHeader();
  loadStandings();
  loadMatches();
  loadScorers();
  loadDefense();
  loadTeams();
}

// ===== HELPERS =====
function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(s) {
  if (!s) return '';
  return new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function statusData(s) {
  const m = {
    FINISHED: { text: 'ENCERRADO', cls: 'mpill-fin', card: 'fin' },
    SCHEDULED: { text: 'AGENDADO', cls: 'mpill-sch', card: 'sch' },
    IN_PROGRESS: { text: 'AO VIVO', cls: 'mpill-liv', card: 'liv' },
    LIVE: { text: 'AO VIVO', cls: 'mpill-liv', card: 'liv' },
  };
  return m[s] || { text: s ? s.toUpperCase() : '', cls: 'mpill-sch', card: 'sch' };
}

function logoUrl(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  const b = 'https://futebol.pmcgs.pr.gov.br'; // Base URL para imagens
  return b + (p.startsWith('/') ? '' : '/') + p;
}

function showState(loadId, contentId, emptyId, state) {
  const l = document.getElementById(loadId);
  const c = document.getElementById(contentId);
  const e = document.getElementById(emptyId);
  if (l) l.style.display = state === 'loading' ? 'flex' : 'none';
  if (c) c.style.display = state === 'content' ? 'block' : 'none';
  if (e) e.style.display = state === 'empty' ? 'block' : 'none';
}

async function apiFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ===== HEADER =====
async function loadHeader() {
  try {
    const d = await apiFetch(API.info());
    apiCurrentRound = d.currentRoundNumber || 1;
    
    const nameEl = document.getElementById('champ-name');
    const descEl = document.getElementById('champ-description');
    
    if (nameEl) nameEl.textContent = (d.name || 'CAMPEONATO').toUpperCase();
    if (descEl) descEl.textContent = (d.description || '').toUpperCase();
    
    const loadingHeader = document.getElementById('header-loading');
    const infoHeader = document.getElementById('header-info');
    
    if (loadingHeader) loadingHeader.style.display = 'none';
    if (infoHeader) infoHeader.style.display = 'block';
    
    if (d.name) document.title = d.name.toUpperCase() + ' - Prefeitura de Campina Grande do Sul';
  } catch (e) {
    console.error('Header:', e);
    const loadingHeader = document.getElementById('header-loading');
    const infoHeader = document.getElementById('header-info');
    if (loadingHeader) loadingHeader.style.display = 'none';
    if (infoHeader) infoHeader.style.display = 'block';
  }
}

// ===== CLASSIFICACAO =====
async function loadStandings() {
  showState('standings-loading', 'standings-content', 'standings-empty', 'loading');
  try {
    const data = await apiFetch(API.standings());
    if (!data || !data.length) { showState('standings-loading', 'standings-content', 'standings-empty', 'empty'); return; }
    const tbody = document.getElementById('standings-body');
    tbody.innerHTML = '';
    data.forEach((r, i) => {
      const isLastTwo = (i >= data.length - 2);
      let posClass = 'px';
      if (r.position === 1) posClass = 'p1';
      else if (r.position === 2) posClass = 'p2';
      else if (r.position === 3) posClass = 'p3';
      else if (isLastTwo) posClass = 'pr';

      const sgClass = r.goalDifference > 0 ? 'sg-pos' : r.goalDifference < 0 ? 'sg-neg' : 'sg-zero';
      const sgVal = r.goalDifference > 0 ? '+' + r.goalDifference : r.goalDifference;
      const logo = r.team.logo ? `<img src="${logoUrl(r.team.logo)}" alt="">` : '';
      const tr = document.createElement('tr');
      if (isLastTwo) tr.className = 'relegation-row';
      tr.innerHTML =
        `<td><span class="pbadge ${posClass}">${r.position}</span></td>` +
        `<td><div class="club">${logo}<span>${esc(r.team.name).toUpperCase()}</span></div></td>` +
        `<td class="pts">${r.points}</td>` +
        `<td>${r.played}</td>` +
        `<td>${r.wins}</td>` +
        `<td>${r.draws}</td>` +
        `<td>${r.losses}</td>` +
        `<td>${r.goalsFor}</td>` +
        `<td>${r.goalsAgainst}</td>` +
        `<td class="${sgClass}">${sgVal}</td>`;
      tbody.appendChild(tr);
    });
    showState('standings-loading', 'standings-content', 'standings-empty', 'content');
  } catch (e) {
    console.error('Standings:', e);
    showState('standings-loading', 'standings-content', 'standings-empty', 'empty');
  }
}

// ===== MATCHES =====
function renderRound(idx) {
  const grid = document.getElementById('matches-grid');
  const round = roundsData[idx];
  if (!round || !round.matches || !round.matches.length) {
    grid.innerHTML = '<div class="empty"><i class="fas fa-futbol"></i><p>SEM JOGOS NESTA RODADA</p></div>';
    return;
  }
  grid.innerHTML = '';
  
  const venues = {};
  round.matches.forEach(m => {
    const vName = (m.stadium && m.stadium.name) ? m.stadium.name.toUpperCase() : 'OUTRO LOCAL';
    if (!venues[vName]) venues[vName] = [];
    venues[vName].push(m);
  });

  const sortedVenues = Object.keys(venues).sort((a, b) => {
    function getPriority(name) {
      if (name.includes('JARDIM PAULISTA')) return 1;
      if (name.includes('SEDE')) return 2;
      if (name.includes('SANTA ROSA')) return 3;
      return 99;
    }
    return getPriority(a) - getPriority(b);
  });

  sortedVenues.forEach(vName => {
    const col = document.createElement('div');
    col.className = 'venue-col';
    
    const header = document.createElement('div');
    header.className = 'venue-header';
    header.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + vName;
    col.appendChild(header);

    const matchesList = document.createElement('div');
    matchesList.className = 'venue-matches';

    venues[vName].forEach(m => {
      const si = statusData(m.status);
      const fin = m.status === 'FINISHED';
      
      const logoA = m.teamA && m.teamA.logo ? `<img src="${logoUrl(m.teamA.logo)}" alt="">` : '';
      const logoB = m.teamB && m.teamB.logo ? `<img src="${logoUrl(m.teamB.logo)}" alt="">` : '';
      const nameA = m.teamA ? esc(m.teamA.name).toUpperCase() : 'A DEFINIR';
      const nameB = m.teamB ? esc(m.teamB.name).toUpperCase() : 'A DEFINIR';
      
      const scoreA = m.teamAScore != null ? m.teamAScore : '-';
      const scoreB = m.teamBScore != null ? m.teamBScore : '-';
      const classA = (fin && m.teamAScore > m.teamBScore) ? 'v-winner' : '';
      const classB = (fin && m.teamBScore > m.teamAScore) ? 'v-winner' : '';

      const scoreHtml = fin
        ? `<div class="mcard-score"><span class="${classA}">${scoreA}</span><span class="x">X</span><span class="${classB}">${scoreB}</span></div>`
        : '<div class="mcard-vs">VS</div>';
        
      const card = document.createElement('div');
      card.className = 'mcard ' + si.card;
      card.innerHTML =
        '<div class="mcard-top">' +
          `<div class="mcard-date">${fmtDate(m.dataHora)}</div>` +
          `<div class="mcard-hour">${fmtTime(m.dataHora)}</div>` +
        '</div>' +
        '<div class="mcard-body">' +
          `<div class="mcard-team">${logoA}<div class="mcard-name">${nameA}</div></div>` +
          `<div class="mcard-mid">${scoreHtml}</div>` +
          `<div class="mcard-team">${logoB}<div class="mcard-name">${nameB}</div></div>` +
        '</div>' +
        `<div style="text-align:center"><span class="mpill ${si.cls}">${si.text}</span></div>`;
      matchesList.appendChild(card);
    });

    col.appendChild(matchesList);
    grid.appendChild(col);
  });
}

async function loadMatches() {
  showState('matches-loading', 'matches-content', 'matches-empty', 'loading');
  try {
    const data = await apiFetch(API.matches());
    if (!data || !data.length) { showState('matches-loading', 'matches-content', 'matches-empty', 'empty'); return; }
    
    data.forEach(round => {
      if (round.matches && round.matches.length) {
        round.matches.sort((a, b) => {
          const locA = (a.stadium && a.stadium.name) ? a.stadium.name.toUpperCase() : '';
          const locB = (b.stadium && b.stadium.name) ? b.stadium.name.toUpperCase() : '';
          
          function getPriority(name) {
            if (name.includes('JARDIM PAULISTA')) return 1;
            if (name.includes('SEDE')) return 2;
            if (name.includes('SANTA ROSA')) return 3;
            return 99;
          }

          const prioA = getPriority(locA);
          const prioB = getPriority(locB);

          if (prioA !== prioB) return prioA - prioB;
          if (locA < locB) return -1;
          if (locA > locB) return 1;
          
          return new Date(a.dataHora) - new Date(b.dataHora);
        });
      }
    });

    roundsData = data;
    const sel = document.getElementById('round-select');
    sel.innerHTML = '';
    
    let startIdx = 0;
    data.forEach((r, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      const roundName = (r.round.name || 'RODADA ' + r.round.numero).toUpperCase();
      const matchCount = Array.isArray(r.matches) ? r.matches.length : 0;
      opt.textContent = `${roundName} — ${matchCount} ${matchCount === 1 ? 'PARTIDA' : 'PARTIDAS'}`;
      sel.appendChild(opt);
      
      if (r.round.numero === apiCurrentRound) {
        startIdx = i;
      }
    });
    
    currentRoundIdx = startIdx;
    sel.value = startIdx;
    renderRound(startIdx);
    updateNav();
    showState('matches-loading', 'matches-content', 'matches-empty', 'content');
  } catch (e) {
    console.error('Matches:', e);
    showState('matches-loading', 'matches-content', 'matches-empty', 'empty');
  }
}

function updateNav() {
  const prev = document.getElementById('prev-round');
  const next = document.getElementById('next-round');
  if (prev) prev.disabled = currentRoundIdx <= 0;
  if (next) next.disabled = currentRoundIdx >= roundsData.length - 1;
}

// ===== TOP SCORERS =====
async function loadScorers() {
  showState('scorers-loading', 'scorers-content', 'scorers-empty', 'loading');
  try {
    const data = await apiFetch(API.topScorers());
    if (!data || !data.length) { showState('scorers-loading', 'scorers-content', 'scorers-empty', 'empty'); return; }
    const el = document.getElementById('scorers-content');
    const list = document.createElement('div');
    list.className = 'rklist';
    data.forEach((item, i) => {
      const cls = item.position === 1 ? 'g' : item.position === 2 ? 's' : item.position === 3 ? 'b' : '';
      const logo = item.team && item.team.logo ? `<img src="${logoUrl(item.team.logo)}" alt="${esc(item.team.name).toUpperCase()}" title="${esc(item.team.name).toUpperCase()}">` : '';
      const d = document.createElement('div');
      d.className = 'rkitem ' + cls;
      d.innerHTML =
        `<div class="rkpos">${item.position}</div>` +
        `<div class="rkname">${esc(item.player.name).toUpperCase()}</div>` +
        `<div class="rklogo">${logo}</div>` +
        `<div class="rkval">${item.goals} <small>GOLS</small></div>`;
      list.appendChild(d);
    });
    el.innerHTML = '';
    el.appendChild(list);
    showState('scorers-loading', 'scorers-content', 'scorers-empty', 'content');
  } catch (e) {
    console.error('Scorers:', e);
    showState('scorers-loading', 'scorers-content', 'scorers-empty', 'empty');
  }
}

// ===== DEFENSE =====
async function loadDefense() {
  showState('defense-loading', 'defense-content', 'defense-empty', 'loading');
  try {
    const data = await apiFetch(API.defense());
    if (!data || !data.length) { showState('defense-loading', 'defense-content', 'defense-empty', 'empty'); return; }
    const el = document.getElementById('defense-content');
    const list = document.createElement('div');
    list.className = 'rklist';
    data.forEach((item, i) => {
      const cls = item.position === 1 ? 'g' : item.position === 2 ? 's' : item.position === 3 ? 'b' : '';
      const logo = item.team && item.team.logo ? `<img src="${logoUrl(item.team.logo)}" alt="${esc(item.team.name).toUpperCase()}" title="${esc(item.team.name).toUpperCase()}">` : '';
      const d = document.createElement('div');
      d.className = 'rkitem ' + cls;
      d.innerHTML =
        `<div class="rkpos">${item.position}</div>` +
        `<div class="rkname">${esc(item.team.name).toUpperCase()}</div>` +
        `<div class="rklogo">${logo}</div>` +
        `<div class="rkval">${item.goalsConceded} <small>GOLS</small></div>`;
      list.appendChild(d);
    });
    el.innerHTML = '';
    el.appendChild(list);
    showState('defense-loading', 'defense-content', 'defense-empty', 'content');
  } catch (e) {
    console.error('Defense:', e);
    showState('defense-loading', 'defense-content', 'defense-empty', 'empty');
  }
}

// ===== TEAMS =====
async function loadTeams() {
  showState('teams-loading', 'teams-content', 'teams-empty', 'loading');
  try {
    const data = await apiFetch(API.teams());
    if (!data || !data.length) { showState('teams-loading', 'teams-content', 'teams-empty', 'empty'); return; }
    const el = document.getElementById('teams-content');
    
    const wrap = document.createElement('div');
    wrap.className = 't-marquee-wrap';
    const content = document.createElement('div');
    content.className = 't-marquee-content';
    
    function createTile(t) {
      const imgHtml = t.logo
        ? `<img src="${logoUrl(t.logo)}" alt="${esc(t.name).toUpperCase()}">`
        : '<div class="ttile-ph"><i class="fas fa-shield-alt"></i></div>';
      const d = document.createElement('div');
      d.className = 'ttile';
      d.innerHTML =
        imgHtml +
        `<div class="ttile-name">${esc(t.name).toUpperCase()}</div>`;
      return d;
    }

    data.forEach(t => content.appendChild(createTile(t)));
    data.forEach(t => content.appendChild(createTile(t))); // Loop infinit
    
    wrap.appendChild(content);
    el.innerHTML = '';
    el.appendChild(wrap);
    showState('teams-loading', 'teams-content', 'teams-empty', 'content');
  } catch (e) {
    console.error('Teams:', e);
    showState('teams-loading', 'teams-content', 'teams-empty', 'empty');
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  refreshDashboard();

  const prevBtn = document.getElementById('prev-round');
  const nextBtn = document.getElementById('next-round');
  const roundSel = document.getElementById('round-select');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentRoundIdx > 0) {
        currentRoundIdx--;
        if (roundSel) roundSel.value = currentRoundIdx;
        renderRound(currentRoundIdx);
        updateNav();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentRoundIdx < roundsData.length - 1) {
        currentRoundIdx++;
        if (roundSel) roundSel.value = currentRoundIdx;
        renderRound(currentRoundIdx);
        updateNav();
      }
    });
  }

  if (roundSel) {
    roundSel.addEventListener('change', (e) => {
      currentRoundIdx = parseInt(e.target.value);
      renderRound(currentRoundIdx);
      updateNav();
    });
  }

  // Series Toggle
  document.querySelectorAll('.sbtn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.classList.contains('active')) return;
      document.querySelectorAll('.sbtn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      CONFIG.championshipId = this.getAttribute('data-id');
      refreshDashboard();
    });
  });
});
