(function () {
  'use strict';

  const API_URL = 'https://sibea.pmcgs.pr.gov.br';
  const PAGE_SIZE = 24;
  const SEARCH_DELAY = 400;
  const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">' +
    '<rect width="800" height="560" fill="#eaf6f1"/>' +
    '<circle cx="400" cy="235" r="92" fill="#196b52" opacity=".16"/>' +
    '<path fill="#196b52" d="M369 174c-26-38-76-23-64 22 7 26 35 47 64 64 29-17 57-38 64-64 12-45-38-60-64-22zm81 98c-15 0-27 16-27 35s12 35 27 35 27-16 27-35-12-35-27-35zm-100 0c-15 0-27 16-27 35s12 35 27 35 27-16 27-35-12-35-27-35zm50 23c-24 0-44 25-44 55 0 25 16 39 44 39s44-14 44-39c0-30-20-55-44-55z"/>' +
    '<text x="400" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#5c6b66">Foto indisponivel</text>' +
    '</svg>'
  );

  const facetLabels = {
    sex: { M: 'Macho', F: 'Fêmea' },
    age: { PUPPY: 'Filhote', ADULT: 'Adulto', SENIOR: 'Idoso' },
    size: { SMALL: 'Pequeno', MEDIUM: 'Médio', LARGE: 'Grande' }
  };

  const state = {
    page: 1,
    totalPages: 1,
    facets: { species: [], breeds: [], organizations: [], sex: [], age: [], size: [] },
    listController: null,
    detailController: null,
    searchTimer: null,
    requestSequence: 0
  };

  let elements = {};
  let initialized = false;

  function initTabs() {
    const container = document.querySelector('.bea-tabs');
    if (!container || container.dataset.beaTabsInicializadas === 'true') return;

    const scrollArea = container.querySelector('.bea-tabs-rolagem');
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    const previousButton = container.querySelector('.bea-tabs-seta--esquerda');
    const nextButton = container.querySelector('.bea-tabs-seta--direita');
    const adoptionButton = document.getElementById('ver-animais-disponiveis');

    if (!scrollArea || !tabs.length || !previousButton || !nextButton) return;
    container.dataset.beaTabsInicializadas = 'true';

    function updateArrows() {
      const tolerance = 2;
      const hasOverflow = scrollArea.scrollWidth > scrollArea.clientWidth + tolerance;
      const atStart = scrollArea.scrollLeft <= tolerance;
      const atEnd = scrollArea.scrollLeft + scrollArea.clientWidth >= scrollArea.scrollWidth - tolerance;
      previousButton.hidden = !hasOverflow || atStart;
      nextButton.hidden = !hasOverflow || atEnd;
    }

    function activateTab(tab, moveFocus) {
      tabs.forEach(item => {
        const active = item === tab;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        item.classList.toggle('ativo', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
        item.setAttribute('tabindex', active ? '0' : '-1');
        if (panel) panel.hidden = !active;
      });

      if (tab === tabs[0]) {
        scrollArea.scrollLeft = 0;
      } else {
        tab.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
      if (moveFocus) tab.focus();
      window.requestAnimationFrame(updateArrows);
    }

    function moveSelection(index) {
      activateTab(tabs[(index + tabs.length) % tabs.length], true);
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab, false));
      tab.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveSelection(index + 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveSelection(index - 1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          moveSelection(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          moveSelection(tabs.length - 1);
        }
      });
    });

    function scrollTabs(direction) {
      scrollArea.scrollBy({
        left: direction * Math.max(160, scrollArea.clientWidth * .7),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }

    previousButton.addEventListener('click', () => scrollTabs(-1));
    nextButton.addEventListener('click', () => scrollTabs(1));
    scrollArea.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    if (adoptionButton) {
      adoptionButton.addEventListener('click', event => {
        event.preventDefault();
        activateTab(document.getElementById('adocao-tab'), true);
        container.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    }

    updateArrows();
  }

  class ApiError extends Error {
    constructor(status, body) {
      super(body && body.error ? body.error : `Erro HTTP ${status}`);
      this.status = status;
      this.body = body;
    }
  }

  async function request(path, controller) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    });
    let body = null;
    try {
      body = await response.json();
    } catch (error) {
      body = null;
    }
    if (!response.ok) throw new ApiError(response.status, body);
    return body;
  }

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function addIcon(parent, iconClass) {
    const icon = createElement('i', iconClass);
    icon.setAttribute('aria-hidden', 'true');
    parent.appendChild(icon);
  }

  function setImageSource(image, source) {
    image.src = source || FALLBACK_IMAGE;
    image.addEventListener('error', function handleImageError() {
      image.removeEventListener('error', handleImageError);
      image.src = FALLBACK_IMAGE;
    });
  }

  function option(value, label, count) {
    const item = createElement('option');
    item.value = value;
    item.textContent = count === undefined ? label : `${label} (${count})`;
    return item;
  }

  function fillSelect(select, items, valueKey, labelKey, emptyLabel) {
    const current = select.value;
    select.replaceChildren(option('', emptyLabel));
    items.forEach(item => select.appendChild(option(item[valueKey], item[labelKey], item.count)));
    if (Array.from(select.options).some(item => item.value === current)) select.value = current;
    select.disabled = false;
  }

  function fillValueFacet(select, items, type, emptyLabel) {
    const normalized = items.map(item => ({
      value: item.value,
      label: facetLabels[type][item.value] || item.value,
      count: item.count
    }));
    fillSelect(select, normalized, 'value', 'label', emptyLabel);
  }

  function updateBreedOptions() {
    const speciesId = elements.species.value;
    const breeds = speciesId
      ? state.facets.breeds.filter(breed => breed.speciesId === speciesId)
      : [];
    fillSelect(elements.breed, breeds, 'id', 'name', 'Todas');
    elements.breed.value = '';
    elements.breed.disabled = !speciesId || breeds.length === 0;
  }

  async function loadFacets() {
    try {
      const facets = await request('/api/adoption/animals/facets');
      state.facets = {
        species: Array.isArray(facets.species) ? facets.species : [],
        breeds: Array.isArray(facets.breeds) ? facets.breeds : [],
        organizations: Array.isArray(facets.organizations) ? facets.organizations : [],
        sex: Array.isArray(facets.sex) ? facets.sex : [],
        age: Array.isArray(facets.age) ? facets.age : [],
        size: Array.isArray(facets.size) ? facets.size : []
      };
      fillSelect(elements.species, state.facets.species, 'id', 'name', 'Todas');
      fillValueFacet(elements.sex, state.facets.sex, 'sex', 'Todos');
      fillValueFacet(elements.age, state.facets.age, 'age', 'Todas');
      fillValueFacet(elements.size, state.facets.size, 'size', 'Todos');
      updateBreedOptions();
      elements.filterWarning.hidden = true;
    } catch (error) {
      if (error.name === 'AbortError') return;
      elements.filterWarning.hidden = false;
      elements.filterWarning.textContent = 'Não foi possível carregar as opções dos filtros. A listagem de animais continua disponível.';
    }
  }

  function getFilters() {
    const data = new FormData(elements.filters);
    const filters = { page: state.page, pageSize: PAGE_SIZE };
    data.forEach((value, key) => {
      const normalized = String(value).trim();
      if (normalized !== '') filters[key] = normalized;
    });
    return filters;
  }

  function buildQuery(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    return params.toString();
  }

  function renderLoading() {
    elements.results.setAttribute('aria-busy', 'true');
    elements.summary.textContent = 'Carregando animais disponíveis…';
    elements.pagination.replaceChildren();
    const loading = createElement('div', 'bea-state bea-state--loading');
    const spinner = createElement('span', 'bea-spinner');
    spinner.setAttribute('aria-hidden', 'true');
    loading.appendChild(spinner);
    loading.appendChild(createElement('p', '', 'Buscando animais…'));
    elements.results.replaceChildren(loading);
  }

  function renderEmpty() {
    const empty = createElement('div', 'bea-state');
    addIcon(empty, 'fas fa-paw');
    empty.appendChild(createElement('h3', '', 'Nenhum animal encontrado'));
    empty.appendChild(createElement('p', '', 'Tente remover ou alterar alguns filtros para ampliar a busca.'));
    elements.results.replaceChildren(empty);
    elements.summary.textContent = 'Nenhum animal disponível com os filtros selecionados.';
    elements.pagination.replaceChildren();
  }

  function errorMessage(error) {
    if (error.status === 400) {
      const details = error.body && Array.isArray(error.body.details)
        ? error.body.details.map(item => item.message).filter(Boolean).join(' ')
        : '';
      return details || 'Revise os filtros informados e tente novamente.';
    }
    if (error.status === 404) return 'O serviço solicitado não foi encontrado.';
    if (error.status >= 500) return 'O SIBEA está temporariamente indisponível. Tente novamente em alguns instantes.';
    return 'Não foi possível consultar os animais. Verifique sua conexão e tente novamente.';
  }

  function renderError(error) {
    const box = createElement('div', 'bea-state bea-state--error');
    addIcon(box, 'fas fa-circle-exclamation');
    box.appendChild(createElement('h3', '', 'Não foi possível carregar os animais'));
    box.appendChild(createElement('p', '', errorMessage(error)));
    const retry = createElement('button', 'bea-retry-button', 'Tentar novamente');
    retry.type = 'button';
    retry.addEventListener('click', loadAnimals);
    box.appendChild(retry);
    elements.results.replaceChildren(box);
    elements.summary.textContent = 'Erro ao carregar a listagem.';
    elements.pagination.replaceChildren();
  }

  function createBadge(iconClass, text) {
    const badge = createElement('span', 'bea-animal-badge');
    addIcon(badge, iconClass);
    badge.appendChild(document.createTextNode(text));
    return badge;
  }

  function createAnimalCard(animal) {
    const article = createElement('article', 'bea-animal-card');
    const imageWrap = createElement('div', 'bea-animal-card__image');
    const image = createElement('img');
    image.alt = animal.name ? `Foto de ${animal.name}` : 'Foto do animal disponível para adoção';
    image.loading = 'lazy';
    setImageSource(image, animal.image);
    imageWrap.appendChild(image);
    article.appendChild(imageWrap);

    const content = createElement('div', 'bea-animal-card__content');
    const species = animal.species && animal.species.name ? animal.species.name : 'Animal';
    content.appendChild(createElement('p', 'bea-animal-card__species', species));
    content.appendChild(createElement('h3', '', animal.name || 'Sem nome informado'));

    const meta = createElement('div', 'bea-animal-card__meta');
    if (animal.sexLabel) meta.appendChild(createBadge('fas fa-venus-mars', animal.sexLabel));
    if (animal.ageLabel) meta.appendChild(createBadge('fas fa-cake-candles', animal.ageLabel));
    if (animal.sizeLabel) meta.appendChild(createBadge('fas fa-ruler', animal.sizeLabel));
    content.appendChild(meta);

    if (animal.breed && animal.breed.name) content.appendChild(createElement('p', 'bea-animal-card__breed', animal.breed.name));
    if (animal.characteristics) content.appendChild(createElement('p', 'bea-animal-card__description', animal.characteristics));

    const button = createElement('button', 'bea-animal-card__button', 'Conhecer este animal');
    button.type = 'button';
    button.dataset.animalId = animal.id;
    button.setAttribute('aria-label', `Ver detalhes de ${animal.name || 'animal'}`);
    content.appendChild(button);
    article.appendChild(content);
    return article;
  }

  function pageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const values = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) values.push('…');
    for (let page = start; page <= end; page += 1) values.push(page);
    if (end < total - 1) values.push('…');
    values.push(total);
    return values;
  }

  function paginationButton(label, page, disabled, current, ariaLabel) {
    const button = createElement('button', current ? 'active' : '', label);
    button.type = 'button';
    button.disabled = disabled;
    button.dataset.page = String(page);
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    if (current) button.setAttribute('aria-current', 'page');
    return button;
  }

  function renderPagination() {
    elements.pagination.replaceChildren();
    if (state.totalPages <= 1) return;
    elements.pagination.appendChild(paginationButton('‹', state.page - 1, state.page === 1, false, 'Página anterior'));
    pageNumbers(state.page, state.totalPages).forEach(value => {
      if (value === '…') {
        const ellipsis = createElement('span', 'bea-pagination__ellipsis', '…');
        ellipsis.setAttribute('aria-hidden', 'true');
        elements.pagination.appendChild(ellipsis);
      } else {
        elements.pagination.appendChild(paginationButton(String(value), value, false, value === state.page, `Página ${value}`));
      }
    });
    elements.pagination.appendChild(paginationButton('›', state.page + 1, state.page === state.totalPages, false, 'Próxima página'));
  }

  function renderAnimals(body) {
    const animals = Array.isArray(body.data) ? body.data : [];
    const pagination = body.pagination || {};
    state.page = Number(pagination.page) || 1;
    state.totalPages = Math.max(1, Number(pagination.totalPages) || 1);
    elements.results.setAttribute('aria-busy', 'false');
    if (!animals.length) {
      renderEmpty();
      return;
    }
    const fragment = document.createDocumentFragment();
    animals.forEach(animal => fragment.appendChild(createAnimalCard(animal)));
    elements.results.replaceChildren(fragment);
    const total = Number(pagination.total) || animals.length;
    elements.summary.textContent = `${total} ${total === 1 ? 'animal encontrado' : 'animais encontrados'}`;
    renderPagination();
  }

  async function loadAnimals() {
    if (state.listController) state.listController.abort();
    state.listController = new AbortController();
    const sequence = ++state.requestSequence;
    renderLoading();
    try {
      const query = buildQuery(getFilters());
      const body = await request(`/api/adoption/animals?${query}`, state.listController);
      if (sequence !== state.requestSequence) return;
      renderAnimals(body);
    } catch (error) {
      if (error.name === 'AbortError' || sequence !== state.requestSequence) return;
      elements.results.setAttribute('aria-busy', 'false');
      renderError(error);
    }
  }

  function detailRow(iconClass, label, value) {
    const item = createElement('div', 'bea-detail-item');
    addIcon(item, iconClass);
    const text = createElement('div');
    text.appendChild(createElement('span', '', label));
    text.appendChild(createElement('strong', '', value));
    item.appendChild(text);
    return item;
  }

  function referencePart(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function interestUrl(animal) {
    const reference = [referencePart(animal.id), referencePart(animal.name)].filter(Boolean).join('-');
    const url = new URL('https://www.campinagrandedosul.pr.gov.br/atendimento-bem-estar-animal/30');
    if (reference) url.searchParams.set('ref', reference);
    return url.toString();
  }

  function renderDetailLoading() {
    const loading = createElement('div', 'bea-detail-state');
    const title = createElement('h2', 'sr-only', 'Detalhes do animal');
    title.id = 'sibea-animal-modal-title';
    loading.appendChild(title);
    const spinner = createElement('span', 'bea-spinner');
    spinner.setAttribute('aria-hidden', 'true');
    loading.appendChild(spinner);
    loading.appendChild(createElement('p', '', 'Carregando detalhes…'));
    elements.detail.replaceChildren(loading);
  }

  function renderDetail(animal) {
    const layout = createElement('div', 'bea-animal-detail__layout');
    const image = createElement('img', 'bea-animal-detail__image');
    image.alt = animal.name ? `Foto de ${animal.name}` : 'Foto do animal';
    setImageSource(image, animal.image);
    layout.appendChild(image);

    const content = createElement('div', 'bea-animal-detail__content');
    content.appendChild(createElement('p', 'bea-kicker', animal.species && animal.species.name ? animal.species.name : 'Adoção responsável'));
    const title = createElement('h2', '', animal.name || 'Sem nome informado');
    title.id = 'sibea-animal-modal-title';
    content.appendChild(title);
    if (animal.breed && animal.breed.name) content.appendChild(createElement('p', 'bea-animal-detail__breed', animal.breed.name));

    const facts = createElement('div', 'bea-animal-detail__facts');
    if (animal.sexLabel) facts.appendChild(detailRow('fas fa-venus-mars', 'Sexo', animal.sexLabel));
    if (animal.ageLabel) facts.appendChild(detailRow('fas fa-cake-candles', 'Idade', animal.ageLabel));
    if (animal.sizeLabel) facts.appendChild(detailRow('fas fa-ruler', 'Porte', animal.sizeLabel));
    if (animal.weight !== null && animal.weight !== undefined) facts.appendChild(detailRow('fas fa-weight-scale', 'Peso', `${animal.weight} kg`));
    facts.appendChild(detailRow('fas fa-shield-heart', 'Castração', animal.castrated ? 'Castrado' : 'Não castrado'));
    facts.appendChild(detailRow('fas fa-syringe', 'Vacinação', animal.vaccinated ? 'Vacinado' : 'Não vacinado'));
    content.appendChild(facts);

    if (animal.characteristics) {
      content.appendChild(createElement('h3', '', 'Sobre este animal'));
      content.appendChild(createElement('p', 'bea-animal-detail__description', animal.characteristics));
    }
    if (animal.organization && animal.organization.name) {
      content.appendChild(createElement('p', 'bea-animal-detail__organization', `Disponibilizado por: ${animal.organization.name}`));
    }

    const interestLink = createElement('a', 'bea-animal-detail__interest');
    interestLink.href = interestUrl(animal);
    addIcon(interestLink, 'fas fa-heart');
    interestLink.appendChild(document.createTextNode('Tenho interesse neste animal'));
    content.appendChild(interestLink);

    layout.appendChild(content);
    elements.detail.replaceChildren(layout);
  }

  function renderDetailError(error) {
    const box = createElement('div', 'bea-detail-state bea-state--error');
    addIcon(box, 'fas fa-circle-exclamation');
    const unavailable = error.status === 404;
    const title = createElement('h2', '', unavailable ? 'Animal não encontrado' : 'Não foi possível carregar os detalhes');
    title.id = 'sibea-animal-modal-title';
    box.appendChild(title);
    box.appendChild(createElement('p', '', unavailable
      ? 'Este animal não existe ou não está mais disponível para adoção.'
      : errorMessage(error)));
    elements.detail.replaceChildren(box);
  }

  async function openDetail(id) {
    if (!id) return;
    if (state.detailController) state.detailController.abort();
    state.detailController = new AbortController();
    renderDetailLoading();
    $('#sibea-animal-modal').modal('show');
    try {
      const body = await request(`/api/adoption/animals/${encodeURIComponent(id)}`, state.detailController);
      renderDetail(body.data || {});
    } catch (error) {
      if (error.name === 'AbortError') return;
      renderDetailError(error);
    }
  }

  function resetAndLoad() {
    state.page = 1;
    loadAnimals();
  }

  function bindEvents() {
    elements.filters.addEventListener('submit', event => event.preventDefault());
    elements.search.addEventListener('input', () => {
      window.clearTimeout(state.searchTimer);
      state.searchTimer = window.setTimeout(resetAndLoad, SEARCH_DELAY);
    });
    elements.filters.addEventListener('change', event => {
      if (event.target === elements.search) return;
      if (event.target === elements.species) updateBreedOptions();
      resetAndLoad();
    });
    elements.clear.addEventListener('click', () => {
      window.clearTimeout(state.searchTimer);
      elements.filters.reset();
      updateBreedOptions();
      resetAndLoad();
      elements.search.focus();
    });
    elements.results.addEventListener('click', event => {
      const button = event.target.closest('[data-animal-id]');
      if (button) openDetail(button.dataset.animalId);
    });
    elements.pagination.addEventListener('click', event => {
      const button = event.target.closest('[data-page]');
      if (!button || button.disabled) return;
      state.page = Number(button.dataset.page);
      loadAnimals();
      elements.summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('#sibea-animal-modal').on('hidden.bs.modal', () => {
      if (state.detailController) state.detailController.abort();
    });
  }

  function init() {
    initTabs();
    if (initialized || !document.getElementById('sibea-adoption-list')) return;
    initialized = true;
    elements = {
      filters: document.getElementById('sibea-filters'),
      search: document.getElementById('sibea-q'),
      species: document.getElementById('sibea-species'),
      breed: document.getElementById('sibea-breed'),
      sex: document.getElementById('sibea-sex'),
      age: document.getElementById('sibea-age'),
      size: document.getElementById('sibea-size'),
      clear: document.getElementById('sibea-clear-filters'),
      filterWarning: document.getElementById('sibea-filter-warning'),
      summary: document.getElementById('sibea-results-summary'),
      results: document.getElementById('sibea-results'),
      pagination: document.getElementById('sibea-pagination'),
      detail: document.getElementById('sibea-animal-detail')
    };
    bindEvents();
    loadFacets();
    loadAnimals();
  }

  window.SibeaAdoption = { init };
}());
