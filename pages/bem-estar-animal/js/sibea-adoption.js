(function () {
  'use strict';

  const API_URL = 'https://sibea.pmcgs.pr.gov.br';
  const PAGE_SIZE = 24;
  const API_PAGE_SIZE = 50;
  const SEARCH_DELAY = 400;

  const facetLabels = {
    sex: { M: 'Macho', F: 'Fêmea' },
    age: { PUPPY: 'Filhote', ADULT: 'Adulto', SENIOR: 'Idoso' },
    size: { SMALL: 'Pequeno', MEDIUM: 'Médio', LARGE: 'Grande' }
  };

  const state = {
    page: 1,
    totalPages: 1,
    total: 0,
    animals: [],
    facets: { species: [], breeds: [], organizations: [], sex: [], age: [], size: [] },
    listController: null,
    detailController: null,
    interestController: null,
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
    const adoptionButtons = Array.from(container.querySelectorAll('.bea-scroll-adocao'));

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
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
        item.setAttribute('tabindex', active ? '0' : '-1');
        if (panel) {
          panel.classList.toggle('active', active);
          panel.classList.toggle('show', active);
        }
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

    adoptionButtons.forEach(adoptionButton => {
      adoptionButton.addEventListener('click', event => {
        event.preventDefault();
        activateTab(document.getElementById('adocao-tab'), true);
        container.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });

    activateTab(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0], false);
  }

  class ApiError extends Error {
    constructor(status, body) {
      super(body && body.error ? body.error : `Erro HTTP ${status}`);
      this.status = status;
      this.body = body;
    }
  }

  async function request(path, controller, options) {
    const config = Object.assign({
      method: 'GET',
      headers: { Accept: 'application/json' }
    }, options || {});
    const response = await fetch(`${API_URL}${path}`, Object.assign({}, config, {
      signal: controller ? controller.signal : undefined
    }));
    let body = null;
    try {
      body = await response.json();
    } catch (error) {
      body = null;
    }
    if (!response.ok) throw new ApiError(response.status, body);
    return body;
  }

  async function postJson(path, payload, controller) {
    return request(path, controller, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function formatBreedName(name) {
    const value = String(name || '').trim();
    if (!value) return '';
    if (/^s\.?\s*r\.?\s*d\.?$/i.test(value) || /^srd$/i.test(value)) return 'Sem Raça Definida';
    return value;
  }

  function addIcon(parent, iconClass) {
    const icon = createElement('i', iconClass);
    icon.setAttribute('aria-hidden', 'true');
    parent.appendChild(icon);
  }

  function createImagePlaceholder(modifier) {
    const className = modifier
      ? `bea-image-placeholder bea-image-placeholder--${modifier}`
      : 'bea-image-placeholder';
    const placeholder = createElement('div', className);
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', 'Foto indisponível');
    addIcon(placeholder, 'fas fa-paw');
    return placeholder;
  }

  function setImageSource(image, source) {
    if (!source) {
      const wrap = image.parentElement;
      if (wrap) {
        const isDetail = image.classList.contains('bea-animal-detail__image');
        image.replaceWith(createImagePlaceholder(isDetail ? 'detail' : ''));
      }
      return;
    }
    image.src = source;
    image.addEventListener('error', function handleImageError() {
      image.removeEventListener('error', handleImageError);
      const wrap = image.parentElement;
      if (!wrap) return;
      const isDetail = image.classList.contains('bea-animal-detail__image');
      image.replaceWith(createImagePlaceholder(isDetail ? 'detail' : ''));
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
      ? state.facets.breeds.filter(breed => breed.speciesId === speciesId).map(breed => ({
          id: breed.id,
          name: formatBreedName(breed.name) || breed.name,
          count: breed.count
        }))
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
    const filters = {};
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

  function shuffle(items) {
    const list = items.slice();
    for (let index = list.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = list[index];
      list[index] = list[swapIndex];
      list[swapIndex] = current;
    }
    return list;
  }

  async function fetchAllAnimals(filters, controller) {
    const animals = [];
    let page = 1;
    let totalPages = 1;
    let total = 0;

    do {
      const query = buildQuery(Object.assign({}, filters, { page: page, pageSize: API_PAGE_SIZE }));
      const body = await request(`/api/adoption/animals?${query}`, controller);
      const pageAnimals = Array.isArray(body.data) ? body.data : [];
      animals.push.apply(animals, pageAnimals);
      const pagination = body.pagination || {};
      total = Number(pagination.total) || animals.length;
      totalPages = Math.max(1, Number(pagination.totalPages) || 1);
      page += 1;
    } while (page <= totalPages);

    return { animals: animals, total: total };
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

  function createBadge(iconClass, text, modifier) {
    const className = modifier ? `bea-animal-badge bea-animal-badge--${modifier}` : 'bea-animal-badge';
    const badge = createElement('span', className);
    addIcon(badge, iconClass);
    badge.appendChild(document.createTextNode(text));
    return badge;
  }

  function sexBadge(animal) {
    if (!animal.sexLabel) return null;
    if (animal.sex === 'M') return createBadge('fas fa-mars', animal.sexLabel, 'male');
    if (animal.sex === 'F') return createBadge('fas fa-venus', animal.sexLabel, 'female');
    return createBadge('fas fa-venus-mars', animal.sexLabel);
  }

  function createAnimalCard(animal) {
    const article = createElement('article', 'bea-animal-card');
    article.dataset.animalId = animal.id;
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `Ver detalhes de ${animal.name || 'animal'}`);
    const imageWrap = createElement('div', 'bea-animal-card__image');
    const image = createElement('img');
    image.alt = animal.name ? `Foto de ${animal.name}` : 'Foto do animal disponível para adoção';
    image.loading = 'lazy';
    setImageSource(image, animal.image);
    imageWrap.appendChild(image);
    article.appendChild(imageWrap);

    const content = createElement('div', 'bea-animal-card__content');
    const species = animal.species && (animal.species.name || animal.species.popularName)
      ? (animal.species.name || animal.species.popularName)
      : 'Animal';
    content.appendChild(createElement('p', 'bea-animal-card__species', species));
    content.appendChild(createElement('h3', '', animal.name || 'Sem nome informado'));

    const meta = createElement('div', 'bea-animal-card__meta');
    const sex = sexBadge(animal);
    if (sex) meta.appendChild(sex);
    if (animal.ageLabel) meta.appendChild(createBadge('fas fa-cake-candles', animal.ageLabel));
    if (animal.sizeLabel) meta.appendChild(createBadge('fas fa-ruler', animal.sizeLabel));
    content.appendChild(meta);

    if (animal.breed && animal.breed.name) {
      const breedName = formatBreedName(animal.breed.name);
      if (breedName) content.appendChild(createElement('p', 'bea-animal-card__breed', breedName));
    }
    if (animal.characteristics) content.appendChild(createElement('p', 'bea-animal-card__description', animal.characteristics));

    const button = createElement('span', 'bea-animal-card__button', 'Conhecer este animal');
    button.setAttribute('aria-hidden', 'true');
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

  function renderAnimals() {
    const start = (state.page - 1) * PAGE_SIZE;
    const animals = state.animals.slice(start, start + PAGE_SIZE);
    state.totalPages = Math.max(1, Math.ceil(state.animals.length / PAGE_SIZE));
    elements.results.setAttribute('aria-busy', 'false');
    if (!state.animals.length) {
      renderEmpty();
      return;
    }
    const fragment = document.createDocumentFragment();
    animals.forEach(animal => fragment.appendChild(createAnimalCard(animal)));
    elements.results.replaceChildren(fragment);
    const total = state.total || state.animals.length;
    elements.summary.textContent = `${total} ${total === 1 ? 'animal encontrado' : 'animais encontrados'}`;
    renderPagination();
  }

  async function loadAnimals() {
    if (state.listController) state.listController.abort();
    state.listController = new AbortController();
    const sequence = ++state.requestSequence;
    renderLoading();
    try {
      const result = await fetchAllAnimals(getFilters(), state.listController);
      if (sequence !== state.requestSequence) return;
      state.animals = shuffle(result.animals);
      state.total = result.total;
      state.page = Math.min(state.page, Math.max(1, Math.ceil(state.animals.length / PAGE_SIZE) || 1));
      renderAnimals();
    } catch (error) {
      if (error.name === 'AbortError' || sequence !== state.requestSequence) return;
      elements.results.setAttribute('aria-busy', 'false');
      state.animals = [];
      state.total = 0;
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

  function interestErrorMessage(error) {
    if (error.status === 400) {
      const details = error.body && Array.isArray(error.body.details)
        ? error.body.details.map(item => item.message).filter(Boolean).join(' ')
        : '';
      return details || (error.body && error.body.error) || 'Verifique os dados informados e tente novamente.';
    }
    if (error.status === 404) return 'Este animal não está mais disponível para adoção.';
    if (error.status === 409) return 'Já existe uma solicitação em andamento para este animal com este e-mail.';
    if (error.status >= 500) return 'Não foi possível enviar sua solicitação agora. Tente novamente em alguns instantes.';
    return 'Não foi possível enviar sua solicitação. Verifique sua conexão e tente novamente.';
  }

  function createInterestField(id, label, name, options) {
    const config = options || {};
    const field = createElement('div', 'bea-interest-field');
    const fieldLabel = createElement('label', '', label);
    fieldLabel.htmlFor = id;
    field.appendChild(fieldLabel);
    const input = createElement('input');
    input.id = id;
    input.name = name;
    input.type = config.type || 'text';
    if (config.autocomplete) input.autocomplete = config.autocomplete;
    if (config.required) input.required = true;
    if (config.placeholder) input.placeholder = config.placeholder;
    if (config.inputMode) input.inputMode = config.inputMode;
    field.appendChild(input);
    return field;
  }

  function createInterestDisclaimer() {
    const disclaimer = createElement('p', 'text-xs');
    disclaimer.appendChild(document.createTextNode('Ao clicar em enviar, você concorda com o tratamento dos seus dados nos termos da '));
    const lgpdLink = createElement('a');
    lgpdLink.href = 'https://campinagrandedosul.pr.gov.br/lgpd';
    lgpdLink.target = '_blank';
    lgpdLink.rel = 'noopener noreferrer';
    lgpdLink.textContent = 'LGPD';
    disclaimer.appendChild(lgpdLink);
    disclaimer.appendChild(document.createTextNode(' e da nossa '));
    const privacyLink = createElement('a');
    privacyLink.href = 'https://campinagrandedosul.pr.gov.br/politica-de-privacidade';
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener noreferrer';
    privacyLink.textContent = 'Política de Privacidade';
    disclaimer.appendChild(privacyLink);
    disclaimer.appendChild(document.createTextNode('.'));
    return disclaimer;
  }

  function showInterestMessage(form, type, text) {
    let message = form.querySelector('.bea-interest-message');
    if (!message) {
      message = createElement('div', 'bea-interest-message');
      form.appendChild(message);
    }
    message.className = `bea-interest-message bea-interest-message--${type}`;
    message.setAttribute('role', type === 'error' ? 'alert' : 'status');
    message.hidden = false;
    message.textContent = text;
  }

  function clearInterestMessage(form) {
    const message = form.querySelector('.bea-interest-message');
    if (!message) return;
    message.hidden = true;
    message.textContent = '';
    message.className = 'bea-interest-message';
  }

  function setInterestFormBusy(form, busy) {
    form.querySelectorAll('input, button, textarea').forEach(control => {
      control.disabled = busy;
    });
    const submit = form.querySelector('[type="submit"]');
    if (submit) {
      submit.dataset.defaultLabel = submit.dataset.defaultLabel || submit.textContent;
      submit.textContent = busy ? 'Enviando…' : submit.dataset.defaultLabel;
    }
  }

  function createInterestForm(animal) {
    const section = createElement('section', 'bea-interest');
    section.setAttribute('aria-labelledby', 'bea-interest-title');
    const title = createElement('h3', 'bea-interest__title', 'Tenho interesse neste animal');
    title.id = 'bea-interest-title';
    section.appendChild(title);
<<<<<<< HEAD
    if (animal.name) {
      const nameLine = createElement('p', 'bea-interest__animal-name');
      nameLine.appendChild(document.createTextNode('Nome: '));
      nameLine.appendChild(createElement('strong', 'bea-interest__animal-name-value', animal.name));
      section.appendChild(nameLine);
    }
=======
>>>>>>> 4dc6a56fb64a6df96adb3cc6e340411a77771867

    const form = createElement('form', 'bea-interest-form');
    form.id = 'sibea-interest-form';
    form.setAttribute('novalidate', '');

    const animalId = createElement('input');
    animalId.type = 'hidden';
    animalId.name = 'animalId';
    animalId.value = animal.id || '';
    form.appendChild(animalId);

    form.appendChild(createInterestField('sibea-interest-name', 'Nome completo *', 'requesterName', {
      autocomplete: 'name',
      required: true
    }));
    form.appendChild(createInterestField('sibea-interest-email', 'E-mail *', 'requesterEmail', {
      type: 'email',
      autocomplete: 'email',
      required: true
    }));
    form.appendChild(createInterestField('sibea-interest-phone', 'Telefone *', 'requesterPhone', {
      type: 'tel',
      autocomplete: 'tel',
      inputMode: 'tel',
      required: true,
      placeholder: '(00) 00000-0000'
    }));
    form.appendChild(createInterestField('sibea-interest-address', 'Endereço (opcional)', 'address', {
      autocomplete: 'street-address',
      placeholder: 'Rua, número e bairro'
    }));

    form.appendChild(createInterestDisclaimer());

    const submit = createElement('button', 'bea-interest-submit');
    submit.type = 'submit';
    addIcon(submit, 'fas fa-paper-plane');
    submit.appendChild(document.createTextNode('Enviar interesse'));
    form.appendChild(submit);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      clearInterestMessage(form);
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const payload = {
        animalId: String(data.get('animalId') || '').trim(),
        requesterName: String(data.get('requesterName') || '').trim(),
        requesterEmail: String(data.get('requesterEmail') || '').trim(),
        requesterPhone: String(data.get('requesterPhone') || '').trim()
      };
      const address = String(data.get('address') || '').trim();
      if (address) payload.address = address;

      if (state.interestController) state.interestController.abort();
      state.interestController = new AbortController();
      setInterestFormBusy(form, true);

      try {
        const body = await postJson('/api/adoption/interest', payload, state.interestController);
        const animalName = body && body.data && body.data.animalName
          ? body.data.animalName
          : (animal.name || 'animal');
        showInterestMessage(
          form,
          'success',
          `Solicitação enviada com sucesso! Em breve entraremos em contato sobre ${animalName}.`
        );
        form.reset();
        animalId.value = animal.id || '';
      } catch (error) {
        if (error.name === 'AbortError') return;
        showInterestMessage(form, 'error', interestErrorMessage(error));
      } finally {
        setInterestFormBusy(form, false);
      }
    });

    section.appendChild(form);
    return section;
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
    content.appendChild(createElement('p', 'bea-kicker', animal.species && (animal.species.name || animal.species.popularName)
      ? (animal.species.name || animal.species.popularName)
      : 'Adoção responsável'));
    const title = createElement('h2', '', animal.name || 'Sem nome informado');
    title.id = 'sibea-animal-modal-title';
    content.appendChild(title);
    if (animal.breed && animal.breed.name) {
      const breedName = formatBreedName(animal.breed.name);
      if (breedName) content.appendChild(createElement('p', 'bea-animal-detail__breed', breedName));
    }

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

<<<<<<< HEAD
    const interestButton = createElement('button', 'bea-interest-open-button');
    interestButton.type = 'button';
    addIcon(interestButton, 'fas fa-paper-plane');
    interestButton.appendChild(document.createTextNode('Tenho interesse neste animal'));
    interestButton.addEventListener('click', () => openInterestModal(animal));
    content.appendChild(interestButton);
=======
    content.appendChild(createInterestForm(animal));
>>>>>>> 4dc6a56fb64a6df96adb3cc6e340411a77771867

    layout.appendChild(content);
    elements.detail.replaceChildren(layout);
  }

  function openInterestModal(animal) {
    elements.interestFormContainer.replaceChildren(createInterestForm(animal));
    $('#sibea-animal-modal').modal('hide');
    $('#sibea-interest-modal').modal('show');
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
      const card = event.target.closest('[data-animal-id]');
      if (card) openDetail(card.dataset.animalId);
    });
    elements.results.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-animal-id]');
      if (!card) return;
      event.preventDefault();
      openDetail(card.dataset.animalId);
    });
    elements.pagination.addEventListener('click', event => {
      const button = event.target.closest('[data-page]');
      if (!button || button.disabled) return;
      state.page = Number(button.dataset.page);
      renderAnimals();
      elements.summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('#sibea-animal-modal').on('hidden.bs.modal', () => {
      if (state.detailController) state.detailController.abort();
      if (state.interestController) state.interestController.abort();
    });
    $('#sibea-interest-modal').on('hidden.bs.modal', () => {
      if (state.interestController) state.interestController.abort();
      elements.interestFormContainer.replaceChildren();
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
      detail: document.getElementById('sibea-animal-detail'),
      interestFormContainer: document.getElementById('sibea-interest-form-container')
    };
    bindEvents();
    loadFacets();
    loadAnimals();
  }

  window.SibeaAdoption = { init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());