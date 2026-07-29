(function () {
  'use strict';

  const SOURCE_SELECTOR = '.pme-file-source';
  const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/;

  function getExtension(url, name) {
    const value = `${url || ''} ${name || ''}`.split(/[?#]/)[0];
    const match = value.match(/\.([a-z0-9]{1,8})(?:\s|$)/i);
    return match ? match[1].toLowerCase() : 'arquivo';
  }

  function getIcon(extension) {
    if (extension === 'pdf') {
      return { className: 'far fa-file-pdf', type: 'pdf' };
    }
    if (['doc', 'docx', 'odt'].includes(extension)) {
      return { className: 'far fa-file-word', type: 'word' };
    }
    if (['xls', 'xlsx', 'ods', 'csv'].includes(extension)) {
      return { className: 'far fa-file-excel', type: 'excel' };
    }
    return { className: 'far fa-file-alt', type: 'other' };
  }

  function collectCategories(source) {
    return Array.from(source.querySelectorAll('tbody tr')).map(function (row) {
      const titleLink = row.querySelector('td.text-info > a, td a[data-toggle="collapse"]');
      const content = row.querySelector('.collapse');

      if (!titleLink || !content) {
        return null;
      }

      const title = titleLink.textContent.trim();
      const yearMatch = title.match(YEAR_PATTERN);
      const files = Array.from(content.querySelectorAll('ul li a[href], a[href]'))
        .filter(function (link, index, links) {
          return links.indexOf(link) === index;
        })
        .map(function (link) {
          const url = link.getAttribute('href');
          const name = link.textContent.trim() || 'Documento';
          return {
            name: name,
            url: url,
            extension: getExtension(url, name)
          };
        });

      return {
        title: title,
        year: yearMatch ? yearMatch[0] : 'Outros',
        files: files
      };
    }).filter(function (category) {
      return category && category.files.length;
    });
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (typeof text === 'string') {
      element.textContent = text;
    }
    return element;
  }

  function buildFile(file) {
    const item = createElement('li', 'pme-file-item');
    const link = createElement('a', 'pme-file-link');
    const iconData = getIcon(file.extension);
    const iconWrapper = createElement('span', `pme-file-icon pme-file-icon--${iconData.type}`);
    const icon = createElement('i', iconData.className);
    const textWrapper = createElement('span', 'pme-file-text');
    const name = createElement('span', 'pme-file-name', file.name);
    const meta = createElement('span', 'pme-file-meta', `${file.extension} · Documento`);
    const download = createElement('span', 'pme-download-icon');
    const downloadIcon = createElement('i', 'fas fa-download');

    icon.setAttribute('aria-hidden', 'true');
    downloadIcon.setAttribute('aria-hidden', 'true');
    download.setAttribute('aria-label', 'Abrir documento');
    link.href = file.url;
    link.target = '_blank';
    link.rel = 'noopener';

    iconWrapper.appendChild(icon);
    textWrapper.append(name, meta);
    download.appendChild(downloadIcon);
    link.append(iconWrapper, textWrapper, download);
    item.appendChild(link);
    return item;
  }

  function buildFolder(category, index) {
    const folder = createElement('article', 'pme-folder');
    const button = createElement('button', 'pme-folder-button');
    const folderIcon = createElement('i', 'fas fa-folder-open pme-folder-icon');
    const title = createElement('span', 'pme-folder-title', category.title);
    const badge = createElement('span', 'pme-year-badge', category.year);
    const chevron = createElement('i', 'fas fa-chevron-down pme-folder-chevron');
    const panel = createElement('div', 'pme-folder-panel');
    const list = createElement('ul', 'pme-file-list');
    const panelId = `pme-folder-panel-${index}`;
    const buttonId = `pme-folder-button-${index}`;

    folder.dataset.year = category.year;
    button.type = 'button';
    button.id = buttonId;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);
    folderIcon.setAttribute('aria-hidden', 'true');
    chevron.setAttribute('aria-hidden', 'true');
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    panel.hidden = true;

    category.files.forEach(function (file) {
      list.appendChild(buildFile(file));
    });

    button.append(folderIcon, title, badge, chevron);
    panel.appendChild(list);
    folder.append(button, panel);

    button.addEventListener('click', function () {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });

    return folder;
  }

  function buildFilter(categories, folders) {
    const filter = createElement('div', 'pme-year-filter');
    const label = createElement('span', 'pme-filter-label');
    const filterIcon = createElement('i', 'fas fa-filter');
    const years = Array.from(new Set(categories.map(function (category) {
      return category.year;
    }))).sort(function (a, b) {
      if (a === 'Outros') return 1;
      if (b === 'Outros') return -1;
      return Number(b) - Number(a);
    });

    filterIcon.setAttribute('aria-hidden', 'true');
    label.append(filterIcon, document.createTextNode('Filtrar por ano:'));
    filter.appendChild(label);

    ['Todos'].concat(years).forEach(function (year) {
      const button = createElement('button', 'pme-year-button', year);
      const selected = years.length ? year === years[0] : year === 'Todos';
      button.type = 'button';
      button.dataset.year = year === 'Todos' ? 'all' : year;
      button.setAttribute('aria-pressed', String(selected));

      button.addEventListener('click', function () {
        filter.querySelectorAll('.pme-year-button').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        folders.forEach(function (folder) {
          folder.hidden = button.dataset.year !== 'all' &&
            folder.dataset.year !== button.dataset.year;
        });
      });

      filter.appendChild(button);
    });

    if (years.length) {
      folders.forEach(function (folder) {
        folder.hidden = folder.dataset.year !== years[0];
      });
    }

    return filter;
  }

  function transformSource(source) {
    if (source.dataset.pmeProcessed === 'true') {
      return true;
    }

    const legacyAccordion = source.querySelector('#accordionfiles');
    if (!legacyAccordion) {
      return false;
    }

    const categories = collectCategories(source);
    if (!categories.length) {
      return false;
    }

    const fragment = document.createDocumentFragment();
    const folders = categories.map(buildFolder);
    fragment.appendChild(buildFilter(categories, folders));
    folders.forEach(function (folder) {
      fragment.appendChild(folder);
    });

    source.dataset.pmeProcessed = 'true';
    source.replaceChildren(fragment);
    return true;
  }

  function observeSource(source) {
    if (source.dataset.pmeInitialized === 'true') {
      return;
    }
    source.dataset.pmeInitialized = 'true';

    if (!source.getAttribute('data-category')) {
      const previewFilter = buildFilter([], []);
      const message = createElement(
        'p',
        'pme-empty',
        'A área de documentos está pronta. Informe o ID da categoria do SPWeb para carregar as publicações por ano.'
      );
      const allButton = previewFilter.querySelector('.pme-year-button');
      if (allButton) {
        allButton.disabled = true;
      }
      source.append(previewFilter, message);
      return;
    }

    if (transformSource(source)) {
      return;
    }

    const observer = new MutationObserver(function () {
      if (transformSource(source)) {
        observer.disconnect();
      }
    });

    observer.observe(source, { childList: true, subtree: true });
  }

  function init(root) {
    const scope = root && root.querySelectorAll ? root : document;
    if (scope.matches && scope.matches(SOURCE_SELECTOR)) {
      observeSource(scope);
    }
    scope.querySelectorAll(SOURCE_SELECTOR).forEach(observeSource);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }

  const pageObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          init(node);
        }
      });
    });
  });

  pageObserver.observe(document.documentElement, { childList: true, subtree: true });
})();
