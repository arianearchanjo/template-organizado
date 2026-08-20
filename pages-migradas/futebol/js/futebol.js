(function () {
  "use strict";

  const apiOrigin = "https://futebol.pmcgs.pr.gov.br/api/public";
  const localPrefix = "/__footeasy_api/api/public";
  const nativeFetch = window.fetch.bind(window);
  const responseCache = new Map();

  window.fetch = function (resource, options) {
    const method = String(options?.method || "GET").toUpperCase();
    const url = typeof resource === "string" ? resource : resource.url;
    const isPublicApi = url.startsWith(apiOrigin) || url.startsWith(localPrefix);
    if (method !== "GET" || !isPublicApi) return nativeFetch(resource, options);

    const key = url;
    if (!responseCache.has(key)) {
      const pending = nativeFetch(resource, options).then((response) => {
        if (!response.ok) responseCache.delete(key);
        return response;
      }).catch((error) => {
        responseCache.delete(key);
        throw error;
      });
      responseCache.set(key, pending);
    }
    return responseCache.get(key).then((response) => response.clone());
  };
})();


(function ensureFootballMount() {
  "use strict";

  if (document.getElementById("futebol-app")) return;

  const main = document.getElementById("pi-conteudo") || document.querySelector("main");
  if (!main) return;

  const section = document.createElement("section");
  section.className = "futebol-page";
  section.setAttribute("aria-label", "Resultados do futebol municipal");

  const container = document.createElement("div");
  container.className = "container";


  const app = document.createElement("div");
  app.id = "futebol-app";
  app.tabIndex = -1;
  app.setAttribute("aria-live", "polite");
  app.setAttribute("aria-busy", "true");

  container.appendChild(app);
  section.appendChild(container);
  main.insertBefore(section, main.querySelector(":scope > [vw]"));
})();

(function () {
  "use strict";

  const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (localHost) {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = function (resource, options) {
      const url = typeof resource === "string" ? resource : resource.url;
      const api = "https://futebol.pmcgs.pr.gov.br/api/public";
      if (url.startsWith(api)) return nativeFetch(`/__footeasy_api${url.slice("https://futebol.pmcgs.pr.gov.br".length)}`, options);
      return nativeFetch(resource, options);
    };
  }

  const style = document.createElement("style");
  style.textContent = ".fut-tabs-wrap{position:relative}.fut-tabs-arrow{align-items:center;background:var(--fut-verde);border:2px solid #fff;border-radius:50%;color:#fff;height:34px;justify-content:center;position:absolute;top:10px;width:34px;z-index:2}.fut-tabs-arrow.previous{left:-8px}.fut-tabs-arrow.next{right:-8px}.fut-tabs-arrow[hidden]{display:none}@media(max-width:991.98px){.fut-tabs-arrow:not([hidden]){display:flex}}";
  document.head.appendChild(style);

  function enhanceTabs(strip) {
    if (strip.dataset.arrowsReady) return;
    strip.dataset.arrowsReady = "true";
    const wrap = document.createElement("div");
    wrap.className = "fut-tabs-wrap";
    strip.parentNode.insertBefore(wrap, strip);
    wrap.appendChild(strip);
    const makeArrow = (direction, label, icon) => {
      const button = document.createElement("button");
      button.className = `fut-tabs-arrow ${direction}`;
      button.type = "button";
      button.setAttribute("aria-label", label);
      const symbol = document.createElement("span");
      symbol.className = "fut-arrow-symbol";
      symbol.textContent = icon === "left" ? "‹" : "›";
      symbol.setAttribute("aria-hidden", "true");
      button.appendChild(symbol);
      wrap.appendChild(button);
      return button;
    };
    const previous = makeArrow("previous", "Ver abas anteriores", "left");
    const next = makeArrow("next", "Ver mais abas", "right");
    const update = () => {
      previous.hidden = strip.scrollLeft <= 1;
      next.hidden = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
    };
    const scroll = (amount) => strip.scrollBy({ left: amount, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    previous.addEventListener("click", () => scroll(-strip.clientWidth * .7));
    next.addEventListener("click", () => scroll(strip.clientWidth * .7));
    strip.addEventListener("scroll", update, { passive: true });
    strip.addEventListener("click", (event) => {
      if (event.target.closest('[role="tab"]') === strip.querySelector('[role="tab"]')) strip.scrollLeft = 0;
      requestAnimationFrame(update);
    });
    window.addEventListener("resize", update, { passive: true });
    requestAnimationFrame(update);
  }

  const app = document.getElementById("futebol-app");
  new MutationObserver(() => app.querySelectorAll(".fut-tabs").forEach(enhanceTabs)).observe(app, { childList: true, subtree: true });
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let lastChampionship = "";

  function imageUrl(value) {
    try { return value ? new URL(value, FILES).href : ""; } catch (_) { return ""; }
  }

  function initials(name) {
    return String(name || "Equipe").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  }

  function crest(source, name, className) {
    const holder = document.createElement("span");
    holder.className = className;
    if (source) {
      const image = document.createElement("img");
      image.src = imageUrl(source);
      image.alt = `Brasão de ${name}`;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.remove();
        holder.classList.add("is-fallback");
        holder.textContent = initials(name);
      }, { once: true });
      holder.appendChild(image);
    } else {
      holder.classList.add("is-fallback");
      holder.textContent = initials(name);
      holder.setAttribute("aria-label", `Sem brasão cadastrado para ${name}`);
    }
    return holder;
  }

  async function json(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  }

  function addHeaderLogo(championship) {
    const head = app.querySelector(":scope > .fut-head");
    if (!head || head.querySelector(".fut-champ-logo")) return;
    head.prepend(crest(championship.logo, championship.name, "fut-champ-logo"));
  }

  function addStandingsCrests(standings) {
    const rows = app.querySelectorAll("#fut-panel-standings tbody tr");
    rows.forEach((row, index) => {
      const cell = row.cells[1];
      const item = standings[index];
      if (!cell || !item || cell.querySelector(".fut-table-crest")) return;
      const content = document.createElement("span");
      content.className = "fut-table-team";
      while (cell.firstChild) content.appendChild(cell.firstChild);
      content.prepend(crest(item.team?.logo, item.team?.name, "fut-table-crest"));
      cell.appendChild(content);
    });
  }

  function addRankingCrests(panelId, items, defense) {
    const rows = app.querySelectorAll(`#${panelId} .fut-rank`);
    rows.forEach((row, index) => {
      const item = items[index];
      const name = defense ? item?.team?.name : (item?.player?.name || item?.playerName);
      const source = item?.team?.logo || item?.teamLogo;
      const label = [...row.children].find((child) => child.tagName === "STRONG");
      if (!item || !label || row.querySelector(".fut-rank-crest")) return;
      const identity = document.createElement("span");
      identity.className = "fut-rank-identity";
      label.parentNode.insertBefore(identity, label);
      identity.append(crest(source, item?.team?.name || name, "fut-rank-crest"), label);
      if (!defense && item?.team?.name) {
        const team = document.createElement("small");
        team.textContent = item.team.name;
        identity.appendChild(team);
      }
    });
  }

  function upgradeTeamFallbacks() {
    app.querySelectorAll("#fut-panel-teams .fut-team-card").forEach((card) => {
      const name = card.querySelector("h3")?.textContent || "Equipe";
      const fallback = card.querySelector(".fut-logo i");
      if (!fallback) return;
      const holder = fallback.parentElement;
      holder.classList.add("is-fallback");
      holder.textContent = initials(name);
      holder.setAttribute("aria-label", `Sem brasão cadastrado para ${name}`);
    });
  }

  async function enrichDashboard(id, type) {
    try {
      const catalog = await json("/competitions");
      const championship = (catalog.years || []).flatMap((year) => year.championships || []).find((item) => String(item.id) === id);
      if (!championship) return;
      addHeaderLogo(championship);
      if (type === "atual") {
        const results = await Promise.allSettled([
          json(`/championship/${encodeURIComponent(id)}/standings`),
          json(`/championship/${encodeURIComponent(id)}/top-scorers`),
          json(`/championship/${encodeURIComponent(id)}/defense`)
        ]);
        if (results[0].status === "fulfilled") addStandingsCrests(results[0].value || []);
        if (results[1].status === "fulfilled") addRankingCrests("fut-panel-scorers", results[1].value || [], false);
        if (results[2].status === "fulfilled") addRankingCrests("fut-panel-defense", results[2].value || [], true);
      } else {
        const historical = await json(`/historical-championships/${encodeURIComponent(id)}`);
        if (historical.standings?.length) addStandingsCrests(historical.standings);
        addRankingCrests("fut-panel-scorers", historical.topScorers || [], false);
        addRankingCrests("fut-panel-defense", historical.bestDefenses || [], true);
      }
      upgradeTeamFallbacks();
    } catch (_) {
      /* O conteúdo principal continua funcional quando o enriquecimento visual falha. */
    }
  }

  function updateDashboard() {
    const dashboard = Boolean(app.querySelector(".fut-tabs"));
    app.classList.toggle("fut-dashboard", dashboard);
    if (!dashboard) { lastChampionship = ""; return; }
    upgradeTeamFallbacks();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("tipo");
    const key = `${id}:${type}`;
    if (id && key !== lastChampionship) {
      lastChampionship = key;
      enrichDashboard(id, type);
    }
  }

  new MutationObserver(updateDashboard).observe(app, { childList: true, subtree: true });
  window.addEventListener("popstate", () => { lastChampionship = ""; });
  updateDashboard();
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let lastRoute = "";

  async function request(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function valueFor(defense, mode) {
    const raw = defense.rankingValue ?? (mode === "AVERAGE" ? defense.averageConceded : defense.goalsConceded);
    const value = Number(raw);
    if (!Number.isFinite(value)) return "—";
    return mode === "AVERAGE" ? value.toFixed(2).replace(".", ",") : String(Math.trunc(value));
  }

  function addCriterion(panel, mode) {
    let criterion = panel.querySelector(".fut-defense-criterion");
    if (!criterion) {
      criterion = document.createElement("p");
      criterion.className = "fut-defense-criterion";
      const box = panel.querySelector(".fut-box");
      box?.insertBefore(criterion, box.firstChild);
    }
    criterion.textContent = mode === "AVERAGE" ? "Classificação por média de gols sofridos" : "Classificação por total de gols sofridos";
  }

  function updateCrest(row, defense) {
    const source = defense.team?.logo || defense.logo;
    const name = defense.team?.name || defense.teamName || "Equipe";
    const holder = row.querySelector(".fut-rank-crest");
    if (!source || !holder) return;
    let image = holder.querySelector("img");
    if (!image) {
      holder.textContent = "";
      holder.classList.remove("is-fallback");
      image = document.createElement("img");
      holder.appendChild(image);
    }
    image.src = new URL(source, FILES).href;
    image.alt = `Brasão de ${name}`;
    image.loading = "lazy";
  }

  function render(defenses, mode) {
    const panel = app.querySelector("#fut-panel-defense");
    if (!panel) return;
    addCriterion(panel, mode);
    const rows = panel.querySelectorAll(".fut-rank");
    rows.forEach((row, index) => {
      const defense = defenses[index];
      if (!defense) return;
      const badge = row.querySelector(".fut-value");
      if (badge) {
        badge.textContent = valueFor(defense, mode);
        const unit = document.createElement("small");
        unit.textContent = mode === "AVERAGE" ? "média" : "gols sofridos";
        badge.appendChild(unit);
      }
      updateCrest(row, defense);
    });
  }

  async function loadRanking(id, type, routeKey) {
    try {
      if (type === "historico") {
        const championship = await request(`/historical-championships/${encodeURIComponent(id)}`);
        if (lastRoute !== routeKey) return;
        render(Array.isArray(championship.bestDefenses) ? championship.bestDefenses : [], championship.defenseRankingMode);
        return;
      }
      const [championship, defenses] = await Promise.all([
        request(`/championship/${encodeURIComponent(id)}`),
        request(`/championship/${encodeURIComponent(id)}/defense`)
      ]);
      if (lastRoute !== routeKey) return;
      render(Array.isArray(defenses) ? defenses : [], championship.defenseRankingMode);
    } catch (_) {
      /* O estado de erro da seção principal permanece responsável pela mensagem. */
    }
  }

  function update() {
    const panel = app.querySelector("#fut-panel-defense");
    if (!panel) { lastRoute = ""; return; }
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("tipo");
    const routeKey = `${id}:${type}`;
    if (!id || !["atual", "historico"].includes(type) || routeKey === lastRoute) return;
    lastRoute = routeKey;
    loadRanking(id, type, routeKey);
  }

  new MutationObserver(update).observe(app, { childList: true, subtree: true });
  window.addEventListener("popstate", () => { lastRoute = ""; });
  update();
})();


(function () {
  "use strict";

  const app = document.getElementById("futebol-app");
  let scheduled = false;

  function clean() {
    scheduled = false;
    if (!app.querySelector(".fut-tabs")) return;
    const description = app.querySelector(":scope > .fut-head p");
    if (description && !description.dataset.labelCleaned) {
      const year = description.textContent.match(/\b\d{4}\b/);
      description.textContent = year ? year[0] : "Campeonato municipal";
      description.dataset.labelCleaned = "true";
    }
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(clean);
  });
  observer.observe(app, { childList: true });
  clean();
})();


(function () {
  "use strict";

  const app = document.getElementById("futebol-app");
  let scheduled = false;

  function improve() {
    scheduled = false;
    const nextMatch = app.querySelector(":scope > .fut-next");
    if (!nextMatch || nextMatch.dataset.emptyEnhanced) return;
    const state = nextMatch.querySelector(".fut-state");
    if (!state || !state.textContent.includes("Não existem partidas futuras programadas")) return;
    nextMatch.dataset.emptyEnhanced = "true";
    nextMatch.classList.add("fut-next-empty");
    state.textContent = "";
    const icon = document.createElement("span");
    icon.className = "fut-next-empty-icon";
    icon.setAttribute("aria-hidden", "true");
    const symbol = document.createElement("i");
    symbol.className = "fas fa-calendar-check";
    icon.appendChild(symbol);
    const content = document.createElement("div");
    const label = document.createElement("span");
    label.className = "fut-kicker";
    label.textContent = "Agenda de jogos";
    const title = document.createElement("h2");
    title.textContent = "Nenhuma partida programada no momento";
    const description = document.createElement("p");
    description.textContent = "Quando novos jogos forem definidos, as informações aparecerão automaticamente aqui.";
    content.append(label, title, description);
    state.append(icon, content);
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(improve);
  }).observe(app, { childList: true });
  improve();
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let activeRoute = "";
  let scheduled = false;

  async function request(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function team(teamData) {
    const wrapper = document.createElement("div");
    wrapper.className = "fut-current-team";
    const crest = document.createElement("span");
    crest.className = "fut-current-crest";
    if (teamData?.logo) {
      const image = document.createElement("img");
      image.src = new URL(teamData.logo, FILES).href;
      image.alt = `Brasão de ${teamData.name}`;
      image.loading = "lazy";
      crest.appendChild(image);
    } else {
      crest.classList.add("is-fallback");
      crest.textContent = String(teamData?.name || "Equipe").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
    }
    const name = document.createElement("strong");
    name.textContent = teamData?.name || "Equipe não definida";
    wrapper.append(crest, name);
    return wrapper;
  }

  function dateParts(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: "Data a definir", time: "" };
    return {
      date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date),
      time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(date)
    };
  }

  function matchCard(match) {
    const article = document.createElement("article");
    article.className = "fut-current-match";
    const teams = document.createElement("div");
    teams.className = "fut-current-match-teams";
    const score = document.createElement("div");
    score.className = "fut-current-score";
    const finished = match.status === "FINISHED" && match.teamAScore != null && match.teamBScore != null;
    score.textContent = finished ? `${match.teamAScore} × ${match.teamBScore}` : "×";
    teams.append(team(match.teamA), score, team(match.teamB));
    const details = document.createElement("div");
    details.className = "fut-current-details";
    const when = dateParts(match.dataHora);
    const date = document.createElement("span");
    date.innerHTML = '<i class="far fa-calendar" aria-hidden="true"></i>';
    date.append(document.createTextNode(` ${when.date}${when.time ? ` às ${when.time}` : ""}`));
    details.appendChild(date);
    if (match.stadium?.name) {
      const venue = document.createElement("span");
      venue.innerHTML = '<i class="fas fa-map-marker-alt" aria-hidden="true"></i>';
      venue.append(document.createTextNode(` ${match.stadium.name}`));
      details.appendChild(venue);
    }
    const status = document.createElement("span");
    status.className = `fut-current-status status-${String(match.status || "scheduled").toLowerCase()}`;
    status.textContent = match.status === "FINISHED" ? "Encerrado" : match.status === "IN_PROGRESS" || match.status === "LIVE" ? "Em andamento" : "Agendado";
    details.appendChild(status);
    article.append(teams, details);
    return article;
  }

  function render(rounds, routeKey) {
    if (activeRoute !== routeKey) return;
    const panel = app.querySelector("#fut-panel-matches .fut-box");
    if (!panel) return;
    panel.textContent = "";
    const fragment = document.createDocumentFragment();
    rounds.forEach((entry, index) => {
      const section = document.createElement("section");
      section.className = "fut-current-round";
      const heading = document.createElement("h3");
      heading.textContent = entry.round?.name || `Rodada ${entry.round?.numero || index + 1}`;
      const grid = document.createElement("div");
      grid.className = "fut-current-matches-grid";
      (Array.isArray(entry.matches) ? entry.matches : []).forEach((match) => grid.appendChild(matchCard(match)));
      section.append(heading, grid);
      fragment.appendChild(section);
    });
    panel.appendChild(fragment);
  }

  async function load(id, routeKey) {
    try {
      const rounds = await request(`/championship/${encodeURIComponent(id)}/matches`);
      render(Array.isArray(rounds) ? rounds : [], routeKey);
    } catch (_) {
      /* O tratamento original da seção permanece quando a consulta falha. */
    }
  }

  function update() {
    scheduled = false;
    if (!app.querySelector("#fut-panel-matches")) { activeRoute = ""; return; }
    const params = new URLSearchParams(window.location.search);
    if (params.get("tipo") !== "atual") return;
    const id = params.get("id");
    const routeKey = `${id}:atual`;
    if (!id || routeKey === activeRoute) return;
    activeRoute = routeKey;
    load(id, routeKey);
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }).observe(app, { childList: true });
  update();
})();






(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let catalog = null;
  let routeToken = 0;

  const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
  const list = (value) => Array.isArray(value) ? value : [];
  const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
  const imageUrl = (value) => {
    if (!value) return "";
    try { return new URL(value, FILES).href; } catch (_) { return ""; }
  };
  const teamName = (team, fallback) => escapeHtml(team?.name || team?.teamName || fallback || "Equipe");
  const logo = (src, small) => src
    ? `<img class="${small ? "fut-mini-logo" : ""}" src="${escapeHtml(imageUrl(src))}" alt="" loading="lazy">`
    : `<i class="fas fa-shield-alt" aria-hidden="true"></i>`;
  const state = (icon, title, text, action) => `<div class="fut-state"><i class="fas ${icon}" aria-hidden="true"></i><h2>${escapeHtml(title)}</h2>${text ? `<p>${escapeHtml(text)}</p>` : ""}${action || ""}</div>`;
  const empty = (text, title = "Informações ainda não disponíveis") => state("fa-info-circle", title, text);
  const loading = () => `<div class="fut-skeletons" aria-label="Carregando"><div class="fut-skeleton"></div><div class="fut-skeleton"></div><div class="fut-skeleton"></div></div>`;
  const apiMessage = (title, text, label = "Consulta temporariamente indisponível") => `<div class="fut-api-message" role="status"><span class="fut-api-message-icon" aria-hidden="true"><i class="fas fa-exclamation-circle"></i></span><div class="fut-api-message-content"><span class="fut-api-message-label">${escapeHtml(label)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><button class="fut-btn fut-api-retry" type="button" data-retry><i class="fas fa-undo" aria-hidden="true"></i>Tentar novamente</button></div></div>`;

  async function request(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function routeUrl(params) {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(params).toString();
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function navigate(params) {
    history.pushState(null, "", routeUrl(params));
    renderRoute();
  }

  function bindNavigation() {
    app.querySelectorAll("[data-route]").forEach((element) => element.addEventListener("click", () => {
      const params = JSON.parse(element.dataset.route);
      navigate(params);
    }));
  }

  function setPage(title, description) {
    document.title = `${title} | Prefeitura de Campina Grande do Sul`;
  }

  async function getCatalog() {
    if (!catalog) {
      const data = await request("/competitions");
      catalog = { years: list(data?.years) };
    }
    return catalog;
  }

  function findCompetition(id) {
    for (const group of catalog.years) {
      const championship = list(group.championships).find((item) => String(item.id) === id);
      if (championship) return championship;
    }
    return null;
  }

  function header(title, description, backParams, backLabel) {
    return `<div class="fut-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div>${backParams ? `<button class="fut-btn" type="button" data-route='${escapeHtml(JSON.stringify(backParams))}'><i class="fas fa-arrow-left" aria-hidden="true"></i>${escapeHtml(backLabel)}</button>` : ""}</div>`;
  }

  function nextMatchCard(match) {
    if (!match) return `<section class="fut-next">${empty("Não existem partidas futuras programadas.")}</section>`;
    const date = new Date(match.dataHora);
    const validDate = !Number.isNaN(date.getTime());
    const dateText = validDate ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "America/Sao_Paulo" }).format(date) : "Data a definir";
    const timeText = validDate ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(date) : "";
    const venue = [match.stadiumName, match.stadiumCidade].filter(Boolean).join(" — ");
    return `<section class="fut-next" aria-labelledby="proxima-partida"><span class="fut-kicker">Próxima partida</span><h2 id="proxima-partida">${escapeHtml(match.championshipName || "Campeonato municipal")}</h2><div class="fut-match-main"><div class="fut-team"><span class="fut-logo">${logo(match.teamALogo)}</span><strong>${escapeHtml(match.teamAName || "Equipe")}</strong></div><div class="fut-when"><strong>${escapeHtml(dateText)}</strong>${escapeHtml(timeText)}</div><div class="fut-team"><span class="fut-logo">${logo(match.teamBLogo)}</span><strong>${escapeHtml(match.teamBName || "Equipe")}</strong></div></div>${venue ? `<p class="fut-venue"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(venue)}</p>` : ""}</section>`;
  }

  async function renderHome(token) {
    setPage("Futebol", "Campeonatos municipais de Campina Grande do Sul");
    app.innerHTML = loading();
    const results = await Promise.allSettled([getCatalog(), request("/next-match")]);
    if (token !== routeToken) return;
    const catalogResult = results[0];
    const nextResult = results[1];
    const years = catalogResult.status === "fulfilled" ? catalogResult.value.years : [];
    const cards = years.map((group) => {
      const championships = list(group.championships);
      const matches = championships.reduce((sum, item) => sum + number(item?._count?.matches), 0);
      return `<button class="fut-card" type="button" data-route='${escapeHtml(JSON.stringify({ ano: String(group.year) }))}' aria-label="Ver campeonatos de ${escapeHtml(group.year)}"><span class="fut-year">${escapeHtml(group.year)}</span><h3>${championships.length} ${championships.length === 1 ? "campeonato" : "campeonatos"}</h3><span class="fut-meta"><span><i class="fas fa-futbol" aria-hidden="true"></i> ${matches} partidas</span></span></button>`;
    }).join("");
    const next = nextResult.status === "fulfilled" ? nextMatchCard(nextResult.value) : state("fa-exclamation-triangle", "Próxima partida indisponível", "Não foi possível consultar a próxima partida agora.");
    const yearsSection = catalogResult.status === "rejected" ? apiMessage("Não conseguimos carregar os campeonatos", "A conexão com o sistema de futebol falhou. Aguarde alguns instantes e tente novamente.") : (cards || apiMessage("Nenhum campeonato foi encontrado", "O sistema respondeu, mas ainda não há campeonatos disponíveis para exibição.", "Nenhum dado disponível"));
    app.innerHTML = `${next}${header("Campeonatos por ano", "Selecione uma temporada para ver as competições.")}<section class="fut-grid" aria-label="Anos disponíveis">${yearsSection}</section>`;
    bindNavigation();
    app.querySelector("[data-retry]")?.addEventListener("click", () => { catalog = null; renderRoute(); });
  }

  function renderYear(year) {
    const group = catalog.years.find((item) => Number(item.year) === year);
    if (!group) return renderInvalid("O ano informado não está disponível.");
    setPage(`Futebol ${year}`, `Campeonatos municipais de ${year}`);
    const cards = list(group.championships).map((item) => `<button class="fut-card" type="button" data-route='${escapeHtml(JSON.stringify({ id: String(item.id), tipo: item.type }))}'><span class="fut-type ${item.type === "historico" ? "history" : ""}">${item.type === "historico" ? "Histórico" : "Atual"}</span><span class="fut-logo">${logo(item.logo)}</span><h3>${escapeHtml(item.name)}</h3><span class="fut-meta"><span>${escapeHtml(item.year)}</span><span>${number(item?._count?.teams)} equipes</span><span>${number(item?._count?.matches)} partidas</span></span></button>`).join("");
    app.innerHTML = `${header(`Campeonatos de ${year}`, "Escolha uma competição para consultar resultados e estatísticas.", {}, "Voltar aos anos")}<section class="fut-grid" aria-label="Campeonatos do ano">${cards || empty("Não há campeonatos cadastrados neste ano.")}</section>`;
    bindNavigation();
  }

  function sectionState(result, renderer, message, emptyTitle) {
    if (result.status === "rejected") return state("fa-exclamation-triangle", "Seção indisponível", "Não foi possível carregar estes dados.");
    return renderer(result.value) || empty(message, emptyTitle);
  }

  function overview(data, fallback) {
    const item = data || fallback;
    const counts = item?._count || {};
    const stats = [
      [item?.year || fallback?.year || "—", "Ano"],
      [counts.teams ?? list(item?.teams).length, "Equipes"],
      [counts.matches ?? countMatches(item?.rounds), "Partidas"]
    ];
    return `<div class="fut-box"><h3>Visão geral</h3><div class="fut-stats">${stats.map(([value, label]) => `<div class="fut-stat"><strong>${escapeHtml(value)}</strong><span>${label}</span></div>`).join("")}</div></div>`;
  }

  function countMatches(rounds) { return list(rounds).reduce((sum, round) => sum + list(round.matches).length, 0); }
  function matchTeam(match, side) {
    const key = side === "home" ? "A" : "B";
    const team = match[`${side}Team`] || match[`team${key}`] || {};
    const name = match[`${side}TeamName`] || team.name || (side === "home" ? "Mandante" : "Visitante");
    const src = match[`${side}TeamLogo`] || team.logo;
    return { name, src, id: team.id || match[`${side}TeamId`] || match[`team${key}Id`] };
  }

  function matches(data) {
    const rounds = list(data?.rounds || data);
    if (!rounds.length) return "";
    return rounds.map((entry, index) => {
      const round = entry.round || entry;
      const games = list(entry.matches || round.matches);
      const title = round.name || round.roundName || `Rodada ${round.number || round.numero || index + 1}`;
      return `<section class="fut-round"><h3>${escapeHtml(title)}</h3>${games.length ? games.map(matchCard).join("") : empty("Nenhuma partida nesta rodada.")}</section>`;
    }).join("");
  }

  function matchCard(match) {
    const home = matchTeam(match, "home");
    const away = matchTeam(match, "away");
    const hasScore = (match.homeScore ?? match.teamAScore) != null && (match.awayScore ?? match.teamBScore) != null;
    const score = hasScore ? `${number(match.homeScore ?? match.teamAScore)} × ${number(match.awayScore ?? match.teamBScore)}` : "×";
    const hasPenalties = (match.homePenalties ?? match.teamAPenalties) != null && (match.awayPenalties ?? match.teamBPenalties) != null;
    const winner = match.penaltyWinnerTeamId ? (String(match.penaltyWinnerTeamId) === String(home.id) ? home.name : away.name) : "";
    const when = match.playedAt || match.dataHora;
    const info = [when ? formatDateTime(when) : "", match.venue || match.stadium?.name].filter(Boolean).join(" — ");
    const homeOG = match.homeOwnGoals ?? match.teamAOwnGoals;
    const awayOG = match.awayOwnGoals ?? match.teamBOwnGoals;
    const ownGoals = number(homeOG) || number(awayOG) ? `Gols contra: ${home.name} ${number(homeOG)}, ${away.name} ${number(awayOG)}` : "";
    const allScorers = list(match.scorers || match.goals).filter((item) => !item.ownGoal);
    function scorerRow(items, side) {
      const g = new Map();
      items.forEach((i) => {
        const n = i.player?.name || i.playerName || i.name || "";
        if (!n) return;
        const m = i.minute != null ? i.minute : null;
        const e = g.get(n);
        if (e) e.push(m); else g.set(n, [m]);
      });
      const entries = [...g.entries()];
      if (!entries.length) return "";
      const inner = entries.map(([n, minutes]) => {
        const mins = minutes.filter((m) => m != null).map((m) => `<span class="fut-scorer-min">${m}&apos;</span>`).join("");
        return `<span class="fut-scorer"><span class="fut-scorer-name">${escapeHtml(n)}</span>${mins}</span>`;
      }).join('<span class="fut-scorer-sep" aria-hidden="true">&middot;</span>');
      return `<div class="fut-scorers-row fut-scorers-row--${side}"><span class="fut-scorers-list">${inner}</span></div>`;
    }
    const homeRow = scorerRow(allScorers.filter((item) => String(item.teamId) === String(home.id)), "home");
    const awayRow = scorerRow(allScorers.filter((item) => String(item.teamId) === String(away.id)), "away");
    const hasScorers = homeRow || awayRow;
    return `<article class="fut-match"><div class="fut-match-team">${home.src ? logo(home.src, true) : ""}<strong>${escapeHtml(home.name)}</strong></div><div class="fut-score">${escapeHtml(score)}</div><div class="fut-match-team away">${away.src ? logo(away.src, true) : ""}<strong>${escapeHtml(away.name)}</strong></div>${hasScorers ? `<div class="fut-match-scorers">${homeRow}${awayRow}</div>` : ""}${hasPenalties ? `<div class="fut-detail"><strong>Pênaltis:</strong> ${number(match.homePenalties ?? match.teamAPenalties)} × ${number(match.awayPenalties ?? match.teamBPenalties)}${winner ? ` — vencedor: ${escapeHtml(winner)}` : ""}</div>` : ""}${info ? `<div class="fut-detail">${escapeHtml(info)}</div>` : ""}${ownGoals ? `<div class="fut-detail">${escapeHtml(ownGoals)}</div>` : ""}${match.note ? `<div class="fut-detail fut-note">${escapeHtml(match.note)}</div>` : ""}</article>`;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(date);
  }

  function teams(data) {
    const items = list(data?.teams || data);
    return items.length ? `<div class="fut-grid">${items.map((entry) => { const item = entry.team || entry; return `<article class="fut-card fut-team-card"><span class="fut-logo">${logo(item.logo)}</span><h3>${teamName(item)}</h3></article>`; }).join("")}</div>` : "";
  }

  function ranking(data, kind) {
    const items = list(data?.[kind] || data);
    if (!items.length) return "";
    return `<div class="fut-list">${items.map((entry, index) => {
      const name = kind === "bestDefenses" ? (entry.team?.name || entry.teamName || entry.name) : (entry.player?.name || entry.playerName || entry.name);
      const value = kind === "bestDefenses" ? (entry.goalsConceded ?? entry.goalsAgainst ?? 0) : (entry.goals ?? entry.totalGoals ?? 0);
      return `<div class="fut-rank"><span class="fut-pos">${escapeHtml(entry.position || index + 1)}</span><strong>${escapeHtml(name || "Não informado")}</strong><span class="fut-value">${escapeHtml(value)} ${kind === "bestDefenses" ? "sofridos" : "gols"}</span></div>`;
    }).join("")}</div>`;
  }

  function standings(data) {
    const items = list(data?.standings || data);
    if (!items.length) return "";
    return `<div class="fut-table-wrap"><table class="fut-table"><thead><tr><th>#</th><th>Equipe</th><th>PTS</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>${items.map((item, index) => `<tr><td>${escapeHtml(item.position || index + 1)}</td><td>${escapeHtml(item.team?.name || item.teamName || item.name || "Equipe")}</td><td><strong>${number(item.points)}</strong></td><td>${number(item.played ?? item.matchesPlayed)}</td><td>${number(item.wins)}</td><td>${number(item.draws)}</td><td>${number(item.losses)}</td><td>${number(item.goalsFor)}</td><td>${number(item.goalsAgainst)}</td><td>${number(item.goalDifference)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function annotations(data) {
    const items = list(data);
    return items.length ? `<div class="fut-list">${items.map((item) => `<article class="fut-note"><strong>${escapeHtml(item.roundName || `Rodada ${item.roundNumber || ""}`)}</strong><div>${escapeHtml(item.note)}</div></article>`).join("")}</div>` : "";
  }

  function tabs(sections) {
    const available = sections.filter((section) => !section.omit);
    return `<div class="fut-tabs" role="tablist" aria-label="Informações do campeonato">${available.map((section, index) => `<button id="fut-tab-${section.id}" class="fut-tab" type="button" role="tab" aria-selected="${index === 0}" aria-controls="fut-panel-${section.id}" tabindex="${index === 0 ? 0 : -1}">${escapeHtml(section.label)}</button>`).join("")}</div>${available.map((section, index) => `<section id="fut-panel-${section.id}" class="fut-panel" role="tabpanel" aria-labelledby="fut-tab-${section.id}"${index ? " hidden" : ""}>${section.content}</section>`).join("")}`;
  }

  function bindTabs() {
    const tabs = [...app.querySelectorAll('[role="tab"]')];
    const activate = (tab, focus) => {
      tabs.forEach((item) => { const active = item === tab; item.setAttribute("aria-selected", active); item.tabIndex = active ? 0 : -1; document.getElementById(item.getAttribute("aria-controls")).hidden = !active; });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab, false));
      tab.addEventListener("keydown", (event) => {
        let target = null;
        if (event.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") target = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") target = tabs[0];
        if (event.key === "End") target = tabs[tabs.length - 1];
        if (target) { event.preventDefault(); activate(target, true); }
      });
    });
  }

  async function renderCurrent(competition, token) {
    const paths = ["", "/teams", "/matches", "/standings", "/top-scorers", "/defense"];
    const results = await Promise.allSettled(paths.map((path) => request(`/championship/${encodeURIComponent(competition.id)}${path}`)));
    if (token !== routeToken) return;
    const sections = [
      { id: "overview", label: "Visão geral", content: results[0].status === "fulfilled" ? overview(results[0].value, competition) : overview(competition, competition) },
      { id: "matches", label: "Jogos e resultados", content: `<div class="fut-box">${sectionState(results[2], matches, "As partidas aparecerão aqui assim que a competição começar.", "Os jogos ainda não começaram")}</div>` },
      { id: "standings", label: "Classificação", content: `<div class="fut-box">${sectionState(results[3], standings, "A tabela será formada após os primeiros resultados.", "A classificação ainda não começou")}</div>` },
      { id: "teams", label: "Equipes", content: sectionState(results[1], teams, "Ainda não há equipes cadastradas.") },
      { id: "scorers", label: "Artilharia", content: `<div class="fut-box">${sectionState(results[4], (data) => ranking(data, "topScorers"), "Os jogadores aparecerão aqui conforme os gols forem registrados.", "A artilharia começa com a bola rolando")}</div>` },
      { id: "defense", label: "Defesas", content: `<div class="fut-box">${sectionState(results[5], (data) => ranking(data, "bestDefenses"), "O ranking será calculado depois das primeiras partidas.", "As melhores defesas ainda serão definidas")}</div>` }
    ];
    renderDashboard(competition, sections);
  }

  async function renderHistorical(competition, token) {
    let result;
    try { result = await request(`/historical-championships/${encodeURIComponent(competition.id)}`); }
    catch (_) { if (token === routeToken) app.innerHTML = state("fa-exclamation-triangle", "Campeonato indisponível", "Não foi possível carregar o histórico.", `<button class="fut-btn" data-route='{}'>Voltar ao início</button>`); bindNavigation(); return; }
    if (token !== routeToken) return;
    const historicalStandings = list(result.standings).map((item) => ({ ...item, goalDifference: item.goalDifference ?? item.goalDiff }));
    const sections = [
      { id: "overview", label: "Visão geral", content: overview(result, competition) },
      { id: "standings", label: "Classificação", content: `<div class="fut-box">${standings({ standings: historicalStandings }) || empty("Não há classificação registrada.")}</div>` },
      { id: "matches", label: "Jogos e resultados", content: `<div class="fut-box">${matches(result.rounds) || empty("Não há partidas registradas.")}</div>` },
      { id: "teams", label: "Equipes", content: teams(result.teams) || empty("Não há equipes registradas.") },
      { id: "scorers", label: "Artilharia", content: `<div class="fut-box">${ranking(result.topScorers, "topScorers") || empty("Não há artilharia registrada.")}</div>` },
      { id: "defense", label: "Defesas", content: `<div class="fut-box">${ranking(result.bestDefenses, "bestDefenses") || empty("Não há defesas registradas.")}</div>` }
    ];
    renderDashboard({ ...competition, ...result }, sections);
  }

  function renderDashboard(competition, sections) {
    setPage(competition.name || "Campeonato", `${competition.type === "historico" ? "Histórico" : "Resultados"} do campeonato`);
    app.innerHTML = `${header(competition.name || "Campeonato", `${competition.year || ""} · ${competition.type === "historico" ? "Histórico" : "Atual"}`, { ano: String(competition.year) }, `Voltar a ${competition.year}`)}${tabs(sections)}`;
    bindNavigation(); bindTabs();
  }

  function renderInvalid(message) {
    setPage("Página não encontrada", "Futebol municipal");
    app.innerHTML = state("fa-exclamation-circle", "Endereço inválido", message, `<button class="fut-btn" type="button" data-route='{}'>Voltar ao início</button>`);
    bindNavigation();
  }

  async function renderRoute() {
    const token = ++routeToken;
    app.setAttribute("aria-busy", "true");
    app.innerHTML = loading();
    const params = new URLSearchParams(window.location.search);
    try { await getCatalog(); } catch (_) {
      if (token === routeToken) { app.innerHTML = apiMessage("Não conseguimos acessar os resultados", "O serviço de futebol não respondeu neste momento. Verifique novamente em alguns instantes."); app.querySelector("[data-retry]")?.addEventListener("click", () => { catalog = null; renderRoute(); }); }
      app.setAttribute("aria-busy", "false"); return;
    }
    if (token !== routeToken) return;
    const id = params.get("id"); const type = params.get("tipo"); const yearParam = params.get("ano");
    if (id || type) {
      if (!id || !["atual", "historico"].includes(type)) renderInvalid("Informe um campeonato e um tipo válidos.");
      else {
        const competition = findCompetition(id);
        if (!competition || competition.type !== type) renderInvalid("O campeonato não existe ou não pertence ao tipo informado.");
        else { setPage(competition.name, "Carregando informações do campeonato"); app.innerHTML = loading(); if (type === "atual") await renderCurrent(competition, token); else await renderHistorical(competition, token); }
      }
    } else if (yearParam !== null) {
      const year = Number(yearParam);
      if (!/^\d+$/.test(yearParam) || !Number.isInteger(year)) renderInvalid("O ano informado não é válido."); else renderYear(year);
    } else await renderHome(token);
    if (token === routeToken) app.setAttribute("aria-busy", "false");
  }

  window.addEventListener("popstate", renderRoute);
  renderRoute();
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const app = document.getElementById("futebol-app");
  let routeKey = "";
  let scheduled = false;

  async function request(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function removeTechnicalLabels() {
    app.querySelectorAll(".fut-type").forEach((element) => element.remove());
    const description = app.querySelector(":scope > .fut-head p");
    if (!description) return;
    const year = description.textContent.match(/\b\d{4}\b/);
    const cleanText = year ? year[0] : "Campeonato municipal";
    if (description.textContent !== cleanText) description.textContent = cleanText;
  }

  function enrichCurrentScorers(rounds) {
    if (!rounds) return;
    const allMatches = new Map();
    list(rounds).forEach((entry) => {
      const round = entry.round || entry;
      list(entry.matches || round.matches).forEach((match) => {
        if (match.id) allMatches.set(String(match.id), match);
      });
    });
    app.querySelectorAll(".fut-match").forEach((article) => {
      const homeEl = article.querySelector(".fut-match-team strong");
      const awayEl = article.querySelector(".fut-match-team.away strong");
      if (!homeEl || !awayEl) return;
      const homeName = homeEl.textContent;
      const awayName = awayEl.textContent;
      let matchData = null;
      allMatches.forEach((m) => {
        const mHome = m.homeTeam?.name || m.teamA?.name || "";
        const mAway = m.awayTeam?.name || m.teamB?.name || "";
        if (mHome === homeName && mAway === awayName) matchData = m;
      });
      if (!matchData) return;
      const goals = list(matchData.goals || matchData.scorers).filter((g) => !g.ownGoal);
      if (!goals.length) return;
      const homeId = String((matchData.homeTeam || matchData.teamA || {}).id || "");
      const awayId = String((matchData.awayTeam || matchData.teamB || {}).id || "");
      const homeScorers = goals.filter((g) => String(g.teamId) === homeId);
      const awayScorers = goals.filter((g) => String(g.teamId) === awayId);
      if (!homeScorers.length && !awayScorers.length) return;
      const existing = article.querySelector(".fut-match-scorers");
      if (existing) existing.remove();
      function groupScorers(items) {
        const grouped = new Map();
        items.forEach((g) => {
          const name = g.playerName || g.player?.name || g.name || "";
          if (!name) return;
          const m = g.minute != null ? g.minute : null;
          const e = grouped.get(name);
          if (e) e.push(m); else grouped.set(name, [m]);
        });
        return [...grouped.entries()];
      }
      function buildScorerSpan(entries) {
        const span = document.createElement("span");
        span.className = "fut-scorer";
        const nameSpan = document.createElement("span");
        nameSpan.className = "fut-scorer-name";
        nameSpan.textContent = entries[0];
        span.appendChild(nameSpan);
        entries[1].filter((m) => m != null).forEach((m) => {
          const badge = document.createElement("span");
          badge.className = "fut-scorer-min";
          badge.textContent = m + "'";
          span.appendChild(badge);
        });
        return span;
      }
      function buildScorerRow(items, side) {
        const entries = groupScorers(items);
        const row = document.createElement("div");
        row.className = "fut-scorers-row fut-scorers-row--" + side;
        if (!entries.length) return row;
        const listEl = document.createElement("span");
        listEl.className = "fut-scorers-list";
        entries.forEach((e, i) => {
          if (i > 0) {
            const sep = document.createElement("span");
            sep.className = "fut-scorer-sep";
            sep.setAttribute("aria-hidden", "true");
            sep.textContent = "\u00B7";
            listEl.appendChild(sep);
          }
          listEl.appendChild(buildScorerSpan(e));
        });
        row.appendChild(listEl);
        return row;
      }
      const div = document.createElement("div");
      div.className = "fut-match-scorers";
      div.append(buildScorerRow(homeScorers, "home"), buildScorerRow(awayScorers, "away"));
      article.appendChild(div);
    });
  }

  function updateOverview(teams, rounds) {
    const stats = app.querySelectorAll("#fut-panel-overview .fut-stat");
    if (stats.length < 3) return;
    const teamsCount = Array.isArray(teams) ? teams.length : 0;
    const matchesCount = Array.isArray(rounds)
      ? rounds.reduce((total, round) => total + (Array.isArray(round.matches) ? round.matches.length : 0), 0)
      : 0;
    const teamsValue = stats[1].querySelector("strong");
    const matchesValue = stats[2].querySelector("strong");
    if (teamsValue) teamsValue.textContent = String(teamsCount);
    if (matchesValue) matchesValue.textContent = String(matchesCount);
  }

  function enhanceRoundSelector(currentRoundNumber) {
    const panel = app.querySelector("#fut-panel-matches .fut-box");
    const rounds = panel ? [...panel.querySelectorAll(":scope > .fut-current-round")] : [];
    if (!panel || !rounds.length || panel.dataset.roundSelectorReady) return;
    panel.dataset.roundSelectorReady = "true";

    const controls = document.createElement("div");
    controls.className = "fut-round-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "fut-round-button";
    previous.setAttribute("aria-label", "Ver rodada anterior");
    previous.innerHTML = '<span class="fut-arrow-symbol" aria-hidden="true">‹</span>';
    const field = document.createElement("div");
    field.className = "fut-round-field";
    const label = document.createElement("label");
    label.htmlFor = "futebol-round-select";
    label.textContent = "Selecione a rodada";
    const select = document.createElement("select");
    select.id = "futebol-round-select";
    select.className = "fut-round-select";
    rounds.forEach((round, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = round.querySelector("h3")?.textContent || `Rodada ${index + 1}`;
      select.appendChild(option);
    });
    field.append(label, select);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "fut-round-button";
    next.setAttribute("aria-label", "Ver próxima rodada");
    next.innerHTML = '<span class="fut-arrow-symbol" aria-hidden="true">›</span>';
    controls.append(previous, field, next);
    panel.prepend(controls);

    let selected = rounds.findIndex((round) => {
      const text = round.querySelector("h3")?.textContent || "";
      return Number.parseInt(text, 10) === Number(currentRoundNumber);
    });
    if (selected < 0) selected = 0;

    function show(index, focus) {
      selected = Math.max(0, Math.min(index, rounds.length - 1));
      rounds.forEach((round, roundIndex) => { round.hidden = roundIndex !== selected; });
      select.value = String(selected);
      previous.disabled = selected === 0;
      next.disabled = selected === rounds.length - 1;
      if (focus) controls.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    previous.addEventListener("click", () => show(selected - 1, true));
    next.addEventListener("click", () => show(selected + 1, true));
    select.addEventListener("change", () => show(Number(select.value), false));
    show(selected, false);
  }

  async function enrich(id, type, key) {
    try {
      if (type === "atual") {
        const [championship, teams, rounds] = await Promise.all([
          request(`/championship/${encodeURIComponent(id)}`),
          request(`/championship/${encodeURIComponent(id)}/teams`),
          request(`/championship/${encodeURIComponent(id)}/matches`)
        ]);
        if (routeKey !== key) return;
        updateOverview(teams, rounds);
        enrichCurrentScorers(rounds);
        requestAnimationFrame(() => enhanceRoundSelector(championship.currentRoundNumber));
      } else {
        const championship = await request(`/historical-championships/${encodeURIComponent(id)}`);
        if (routeKey !== key) return;
        updateOverview(championship.teams || [], championship.rounds || []);
      }
    } catch (_) {
      /* As mensagens de erro das seções permanecem sob responsabilidade do núcleo. */
    }
  }

  function update() {
    scheduled = false;
    removeTechnicalLabels();
    if (!app.querySelector(".fut-tabs")) { routeKey = ""; return; }
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("tipo");
    const key = `${id}:${type}`;
    if (!id || !["atual", "historico"].includes(type) || key === routeKey) return;
    routeKey = key;
    enrich(id, type, key);
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }).observe(app, { childList: true });
  window.addEventListener("popstate", () => { routeKey = ""; });
  update();
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let routeKey = "";
  let scheduled = false;

  async function request(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function getTeam(team, teamsById) {
    const registered = teamsById.get(String(team?.id)) || {};
    return { ...registered, ...team, logo: team?.logo || registered.logo };
  }

  function teamElement(team) {
    const wrapper = document.createElement("div");
    wrapper.className = "fut-current-team";
    const crest = document.createElement("span");
    crest.className = "fut-current-crest";
    if (team.logo) {
      const image = document.createElement("img");
      image.src = new URL(team.logo, FILES).href;
      image.alt = `Brasão de ${team.name}`;
      image.loading = "lazy";
      crest.appendChild(image);
    } else {
      crest.classList.add("is-fallback");
      crest.textContent = String(team.name || "Equipe").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
    }
    const name = document.createElement("strong");
    name.textContent = team.name || "Equipe não informada";
    wrapper.append(crest, name);
    return wrapper;
  }

  function dateText(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data não informada";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(date);
  }

  function detail(iconClass, text, className) {
    const item = document.createElement("span");
    if (className) item.className = className;
    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");
    item.append(icon, document.createTextNode(` ${text}`));
    return item;
  }

  function matchCard(match, teamsById) {
    const home = getTeam(match.homeTeam, teamsById);
    const away = getTeam(match.awayTeam, teamsById);
    const article = document.createElement("article");
    article.className = "fut-current-match fut-historical-match";
    const teams = document.createElement("div");
    teams.className = "fut-current-match-teams";
    const score = document.createElement("div");
    score.className = "fut-current-score";
    score.textContent = `${match.homeScore ?? 0} × ${match.awayScore ?? 0}`;
    teams.append(teamElement(home), score, teamElement(away));

    const details = document.createElement("div");
    details.className = "fut-current-details";
    details.append(detail("far fa-calendar", dateText(match.playedAt)));
    if (match.venue) details.append(detail("fas fa-map-marker-alt", match.venue));
    details.append(detail("fas fa-check-circle", "Encerrado", "fut-current-status status-finished"));
    article.append(teams, details);

    const scorersList = Array.isArray(match.scorers) ? match.scorers : [];
    const homeId = String(home.id || "");
    const awayId = String(away.id || "");
    const homeScorers = scorersList.filter((s) => String(s.teamId) === homeId);
    const awayScorers = scorersList.filter((s) => String(s.teamId) === awayId);
    if (homeScorers.length || awayScorers.length) {
      function groupScorers(items) {
        const grouped = new Map();
        items.forEach((s) => {
          const name = s.playerName || s.player?.name || s.name || "";
          if (!name) return;
          const m = s.minute != null ? s.minute : null;
          const e = grouped.get(name);
          if (e) e.push(m); else grouped.set(name, [m]);
        });
        return [...grouped.entries()];
      }
      function buildScorerSpan(entries) {
        const span = document.createElement("span");
        span.className = "fut-scorer";
        const nameSpan = document.createElement("span");
        nameSpan.className = "fut-scorer-name";
        nameSpan.textContent = entries[0];
        span.appendChild(nameSpan);
        entries[1].filter((m) => m != null).forEach((m) => {
          const badge = document.createElement("span");
          badge.className = "fut-scorer-min";
          badge.textContent = m + "'";
          span.appendChild(badge);
        });
        return span;
      }
      function buildScorerRow(items, side) {
        const entries = groupScorers(items);
        const row = document.createElement("div");
        row.className = "fut-scorers-row fut-scorers-row--" + side;
        if (!entries.length) return row;
        const list = document.createElement("span");
        list.className = "fut-scorers-list";
        entries.forEach((e, i) => {
          if (i > 0) {
            const sep = document.createElement("span");
            sep.className = "fut-scorer-sep";
            sep.setAttribute("aria-hidden", "true");
            sep.textContent = "\u00B7";
            list.appendChild(sep);
          }
          list.appendChild(buildScorerSpan(e));
        });
        row.appendChild(list);
        return row;
      }
      const scorersDiv = document.createElement("div");
      scorersDiv.className = "fut-match-scorers";
      scorersDiv.append(buildScorerRow(homeScorers, "home"), buildScorerRow(awayScorers, "away"));
      article.appendChild(scorersDiv);
    }

    const extras = document.createElement("div");
    extras.className = "fut-historical-extras";
    const hasPenalties = Number(match.homePenalties) > 0 || Number(match.awayPenalties) > 0;
    if (hasPenalties) {
      const winner = String(match.penaltyWinnerTeamId) === String(home.id) ? home.name : String(match.penaltyWinnerTeamId) === String(away.id) ? away.name : "";
      extras.append(detail("fas fa-bullseye", `Pênaltis: ${match.homePenalties} × ${match.awayPenalties}${winner ? ` · ${winner} vencedor` : ""}`, "fut-historical-penalties"));
    }
    if (Number(match.homeOwnGoals) > 0 || Number(match.awayOwnGoals) > 0) extras.append(detail("fas fa-undo", `Gols contra: ${home.name} ${match.homeOwnGoals || 0}, ${away.name} ${match.awayOwnGoals || 0}`, "fut-historical-own-goals"));
    if (match.note) extras.append(detail("fas fa-sticky-note", match.note, "fut-historical-note"));
    if (extras.children.length) article.appendChild(extras);
    return article;
  }

  function addSelector(panel, rounds) {
    const controls = document.createElement("div");
    controls.className = "fut-round-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "fut-round-button";
    previous.setAttribute("aria-label", "Ver rodada anterior");
    previous.innerHTML = '<span class="fut-arrow-symbol" aria-hidden="true">‹</span>';
    const field = document.createElement("div");
    field.className = "fut-round-field";
    const label = document.createElement("label");
    label.htmlFor = "futebol-historical-round-select";
    label.textContent = "Selecione a rodada";
    const select = document.createElement("select");
    select.id = "futebol-historical-round-select";
    select.className = "fut-round-select";
    rounds.forEach((round, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = round.querySelector("h3")?.textContent || `Rodada ${index + 1}`;
      select.appendChild(option);
    });
    field.append(label, select);
    const next = document.createElement("button");
    next.type = "button";
    next.className = "fut-round-button";
    next.setAttribute("aria-label", "Ver próxima rodada");
    next.innerHTML = '<span class="fut-arrow-symbol" aria-hidden="true">›</span>';
    controls.append(previous, field, next);
    panel.prepend(controls);
    let selected = 0;
    function show(index) {
      selected = Math.max(0, Math.min(index, rounds.length - 1));
      rounds.forEach((round, roundIndex) => { round.hidden = roundIndex !== selected; });
      select.value = String(selected);
      previous.disabled = selected === 0;
      next.disabled = selected === rounds.length - 1;
    }
    previous.addEventListener("click", () => show(selected - 1));
    next.addEventListener("click", () => show(selected + 1));
    select.addEventListener("change", () => show(Number(select.value)));
    show(0);
  }

  function render(championship, key) {
    if (routeKey !== key) return;
    const panel = app.querySelector("#fut-panel-matches .fut-box");
    if (!panel) return;
    const teamsById = new Map((championship.teams || []).map((team) => [String(team.id || team.teamId), team]));
    const annotationsByRound = new Map();
    (championship.annotations || []).forEach((annotation) => {
      const roundId = annotation.roundId || "";
      if (!annotationsByRound.has(roundId)) annotationsByRound.set(roundId, []);
      annotationsByRound.get(roundId).push(annotation);
    });
    panel.textContent = "";
    const roundElements = [];
    (championship.rounds || []).forEach((round, index) => {
      const section = document.createElement("section");
      section.className = "fut-current-round";
      const heading = document.createElement("h3");
      heading.textContent = round.name || `Rodada ${round.number || index + 1}`;
      const grid = document.createElement("div");
      grid.className = "fut-current-matches-grid";
      (round.matches || []).forEach((match) => grid.appendChild(matchCard(match, teamsById)));
      section.append(heading, grid);
      const roundAnnotations = annotationsByRound.get(round.id || "") || [];
      roundAnnotations.forEach((annotation) => {
        const note = document.createElement("div");
        note.className = "fut-round-annotation";
        const icon = document.createElement("i");
        icon.className = "fas fa-sticky-note";
        icon.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.textContent = annotation.note || "";
        note.append(icon, text);
        section.appendChild(note);
      });
      panel.appendChild(section);
      roundElements.push(section);
    });
    if (roundElements.length) addSelector(panel, roundElements);
  }

  async function load(id, key) {
    try { render(await request(`/historical-championships/${encodeURIComponent(id)}`), key); } catch (_) { /* mantém o estado do núcleo */ }
  }

  function update() {
    scheduled = false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tipo") !== "historico" || !app.querySelector("#fut-panel-matches")) { if (params.get("tipo") !== "historico") routeKey = ""; return; }
    const id = params.get("id");
    const key = `${id}:historico`;
    if (!id || key === routeKey) return;
    routeKey = key;
    load(id, key);
  }

  new MutationObserver(() => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }).observe(app, { childList: true });
  window.addEventListener("popstate", () => { routeKey = ""; });
  update();
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let routeKey = "";
  let scheduled = false;

  async function request(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function normalize(item) {
    return {
      position: item.position,
      name: item.team?.name || item.teamName || "Equipe não informada",
      logo: item.team?.logo || item.logo || "",
      played: item.played,
      goalsConceded: item.goalsConceded,
      averageConceded: item.averageConceded,
      rankingValue: item.rankingValue
    };
  }

  function displayedValue(item, mode) {
    const raw = item.rankingValue ?? (mode === "AVERAGE" ? item.averageConceded : item.goalsConceded);
    const value = Number(raw);
    if (!Number.isFinite(value)) return "—";
    return mode === "AVERAGE" ? value.toFixed(2).replace(".", ",") : String(Math.trunc(value));
  }

  function crest(item) {
    const holder = document.createElement("span");
    holder.className = "fut-defense-crest";
    if (item.logo) {
      const image = document.createElement("img");
      image.src = new URL(item.logo, FILES).href;
      image.alt = `Brasão de ${item.name}`;
      image.loading = "lazy";
      holder.appendChild(image);
    } else {
      holder.classList.add("is-fallback");
      holder.textContent = item.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
      holder.setAttribute("aria-label", `Sem brasão cadastrado para ${item.name}`);
    }
    return holder;
  }

  function render(items, mode, key) {
    if (routeKey !== key) return;
    const box = app.querySelector("#fut-panel-defense .fut-box");
    if (!box) return;
    box.textContent = "";

    const criterion = document.createElement("div");
    criterion.className = "fut-defense-rule";
    const criterionTitle = document.createElement("strong");
    criterionTitle.textContent = "Critério do ranking";
    const criterionText = document.createElement("span");
    criterionText.textContent = mode === "AVERAGE" ? "Menor média de gols sofridos por partida" : "Menor total de gols sofridos";
    criterion.append(criterionTitle, criterionText);
    box.appendChild(criterion);

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "fut-defense-empty";
      empty.textContent = "Ainda não há dados de defesa disponíveis.";
      box.appendChild(empty);
      return;
    }

    const list = document.createElement("div");
    list.className = "fut-defense-list";
    items.map(normalize).forEach((item) => {
      const row = document.createElement("article");
      row.className = "fut-defense-row";
      const position = document.createElement("span");
      position.className = "fut-defense-position";
      position.textContent = String(item.position ?? "—");
      const identity = document.createElement("div");
      identity.className = "fut-defense-team";
      const text = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const detail = document.createElement("small");
      const games = Number(item.played);
      const conceded = Number(item.goalsConceded);
      detail.textContent = `${Number.isFinite(games) ? games : 0} ${games === 1 ? "jogo" : "jogos"} · ${Number.isFinite(conceded) ? conceded : 0} ${conceded === 1 ? "gol sofrido" : "gols sofridos"}`;
      text.append(name, detail);
      identity.append(crest(item), text);
      const value = document.createElement("div");
      value.className = "fut-defense-value";
      const number = document.createElement("strong");
      number.textContent = displayedValue(item, mode);
      const unit = document.createElement("small");
      unit.textContent = mode === "AVERAGE" ? "média" : "total";
      value.append(number, unit);
      row.append(position, identity, value);
      list.appendChild(row);
    });
    box.appendChild(list);
  }

  async function load(id, type, key) {
    try {
      if (type === "historico") {
        const championship = await request(`/historical-championships/${encodeURIComponent(id)}`);
        render(Array.isArray(championship.bestDefenses) ? championship.bestDefenses : [], championship.defenseRankingMode, key);
      } else {
        const [championship, defenses] = await Promise.all([
          request(`/championship/${encodeURIComponent(id)}`),
          request(`/championship/${encodeURIComponent(id)}/defense`)
        ]);
        render(Array.isArray(defenses) ? defenses : [], championship.defenseRankingMode, key);
      }
    } catch (_) {
      /* O núcleo mantém o tratamento de indisponibilidade da seção. */
    }
  }

  function update() {
    scheduled = false;
    if (!app.querySelector("#fut-panel-defense")) { routeKey = ""; return; }
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("tipo");
    const key = `${id}:${type}`;
    if (!id || !["atual", "historico"].includes(type) || key === routeKey) return;
    routeKey = key;
    load(id, type, key);
  }

  new MutationObserver(() => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }).observe(app, { childList: true });
  window.addEventListener("popstate", () => { routeKey = ""; });
  update();
})();


(function () {
  "use strict";

  const app = document.getElementById("futebol-app");
  let scheduled = false;

  function enhance() {
    scheduled = false;
    const grid = app.querySelector(':scope > .fut-grid[aria-label="Anos disponíveis"]');
    if (!grid || grid.dataset.searchReady) return;
    grid.dataset.searchReady = "true";

    const toolbar = document.createElement("div");
    toolbar.className = "fut-year-search";
    const label = document.createElement("label");
    label.htmlFor = "futebol-year-search";
    label.textContent = "Buscar campeonato por ano";
    const field = document.createElement("div");
    field.className = "fut-year-search-field";
    const input = document.createElement("input");
    input.id = "futebol-year-search";
    input.type = "search";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.placeholder = "Digite o ano, por exemplo: 2026";
    input.setAttribute("aria-controls", "futebol-years-results");
    field.append(input);
    toolbar.append(label, field);
    grid.id = "futebol-years-results";
    grid.parentNode.insertBefore(toolbar, grid);

    const message = document.createElement("p");
    message.className = "fut-year-search-empty";
    message.hidden = true;
    message.textContent = "Nenhum campeonato encontrado para o ano informado.";
    grid.insertAdjacentElement("afterend", message);

    function filter() {
      const query = input.value.replace(/\D/g, "").slice(0, 4);
      if (input.value !== query) input.value = query;
      const cards = [...grid.querySelectorAll(":scope > .fut-card")];
      let visible = 0;
      cards.forEach((card) => {
        const year = card.querySelector(".fut-year")?.textContent.trim() || "";
        const matches = !query || year.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      message.hidden = visible > 0;
    }

    input.addEventListener("input", filter);
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(enhance);
  }).observe(app, { childList: true });
  enhance();
})();


(function () {
  "use strict";

  const API = "https://futebol.pmcgs.pr.gov.br/api/public";
  const FILES = "https://futebol.pmcgs.pr.gov.br";
  const app = document.getElementById("futebol-app");
  let championsPromise = null;
  let activeChampionshipId = "";
  let scheduled = false;

  function getChampions() {
    if (!championsPromise) {
      championsPromise = fetch(`${API}/champions`, { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => Array.isArray(data) ? data : [])
        .catch((error) => {
          championsPromise = null;
          throw error;
        });
    }
    return championsPromise;
  }

  function initials(name) {
    return String(name || "Campeão").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function render(champion, championshipId) {
    if (activeChampionshipId !== championshipId || !champion?.team) return;
    const panel = app.querySelector("#fut-panel-overview");
    if (!panel || panel.querySelector(".fut-champion")) return;

    const card = document.createElement("section");
    card.className = "fut-champion";
    card.setAttribute("aria-labelledby", "futebol-champion-title");
    const emblem = document.createElement("span");
    emblem.className = "fut-champion-emblem";
    if (champion.team.logo) {
      const image = document.createElement("img");
      image.src = new URL(champion.team.logo, FILES).href;
      image.alt = `Brasão de ${champion.team.name}`;
      image.loading = "lazy";
      emblem.appendChild(image);
    } else {
      emblem.classList.add("is-fallback");
      emblem.textContent = initials(champion.team.name);
    }
    const content = document.createElement("div");
    const label = document.createElement("span");
    label.className = "fut-champion-label";
    label.innerHTML = '<i class="fas fa-trophy" aria-hidden="true"></i> Campeão';
    const title = document.createElement("h3");
    title.id = "futebol-champion-title";
    title.textContent = champion.team.name;
    const description = document.createElement("p");
    description.textContent = `${champion.championshipName} · ${champion.year}`;
    content.append(label, title, description);
    card.append(emblem, content);
    panel.prepend(card);
  }

  async function load(championshipId) {
    try {
      const champions = await getChampions();
      const champion = champions.find((item) => String(item.championshipId) === championshipId);
      if (champion) render(champion, championshipId);
    } catch (_) {
      /* A ausência do bloco não impede o restante da visão geral. */
    }
  }

  function update() {
    scheduled = false;
    const panel = app.querySelector("#fut-panel-overview");
    if (!panel) { activeChampionshipId = ""; return; }
    const championshipId = new URLSearchParams(window.location.search).get("id") || "";
    if (!championshipId || championshipId === activeChampionshipId) return;
    activeChampionshipId = championshipId;
    load(championshipId);
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }).observe(app, { childList: true });
  window.addEventListener("popstate", () => { activeChampionshipId = ""; });
  update();
})();


(function () {
  "use strict";
  const app = document.getElementById("futebol-app");
  let scheduled = false;

  function sortTeams() {
    scheduled = false;
    const grid = app.querySelector("#fut-panel-teams .fut-grid");
    if (!grid || grid.dataset.alphabeticalOrder) return;
    const cards = [...grid.querySelectorAll(":scope > .fut-team-card")];
    cards.sort((first, second) => {
      const firstName = first.querySelector("h3")?.textContent.trim() || "";
      const secondName = second.querySelector("h3")?.textContent.trim() || "";
      return firstName.localeCompare(secondName, "pt-BR", { sensitivity: "base", numeric: true });
    });
    cards.forEach((card) => grid.appendChild(card));
    grid.dataset.alphabeticalOrder = "true";
  }

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sortTeams);
  }).observe(app, { childList: true });
  sortTeams();
})();

