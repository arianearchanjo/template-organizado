(function () {
  "use strict";

  /*
   * O componente de arquivos do portal usa o id fixo "tbl-file". Quando há
   * mais de uma categoria na página, o carregador legado tenta inicializar a
   * mesma tabela novamente. "retrieve" faz o DataTables reutilizar a instância
   * existente, que é o comportamento recomendado para esse cenário.
   */
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
    window.jQuery.extend(true, window.jQuery.fn.dataTable.defaults, {
      retrieve: true
    });
  }

  function initializeLegacyDocumentCards() {
    var sources = Array.prototype.slice.call(
      document.querySelectorAll(".pdm-legacy-doc-source")
    );

    function fileIcon(url) {
      var extension = (url || "").split("?")[0].split(".").pop().toLowerCase();
      if (extension === "pdf") return "fa-file-pdf";
      if (extension === "doc" || extension === "docx") return "fa-file-word";
      if (extension === "xls" || extension === "xlsx") return "fa-file-excel";
      if (extension === "zip" || extension === "rar" || extension === "7z") return "fa-file-zipper";
      return "fa-file-arrow-down";
    }

    function transform(source, observer) {
      if (source.dataset.pdmTransformed === "true") return true;

      var categoryId = source.getAttribute("data-category");
      var stageTitles = categoryId === "48"
        ? ["Plano de Trabalho", "Diagnóstico", "Diretrizes", "Plano de Ação"]
        : ["Plano de Trabalho", "Diagnóstico e Prognóstico", "Cenários e Diretrizes", "Consolidação do Plano"];
      var rows = Array.prototype.slice.call(source.querySelectorAll("tbody tr"));
      var categories = rows.map(function (row, index) {
        var titleLink = row.querySelector("td.text-info > a");
        var content = row.querySelector(".collapse");
        if (!titleLink || !content) return null;

        var files = Array.prototype.slice.call(content.querySelectorAll("ul li a"))
          .map(function (link) {
            return {
              name: link.textContent.trim(),
              url: link.getAttribute("href")
            };
          })
          .filter(function (file) {
            return file.name && file.url;
          });

        return {
          title: stageTitles[index] || titleLink.textContent.trim(),
          stage: index + 1,
          files: files
        };
      }).filter(Boolean);

      if (!categories.length) return false;

      var thumb = source.getAttribute("data-thumb");
      var cards = document.createElement("div");
      cards.className = "pdm-legacy-cards";

      categories.forEach(function (category) {
        var card = document.createElement("article");
        card.className = "pdm-legacy-card";

        if (thumb) {
          var image = document.createElement("img");
          image.className = "pdm-legacy-card__cover";
          image.src = thumb;
          image.alt = "";
          image.loading = "lazy";
          card.appendChild(image);
        }

        var body = document.createElement("div");
        body.className = "pdm-legacy-card__body";

        var stage = document.createElement("span");
        stage.className = "pdm-legacy-card__stage";
        stage.textContent = "Etapa " + category.stage;
        body.appendChild(stage);

        var title = document.createElement("h3");
        title.className = "pdm-legacy-card__title";
        title.textContent = category.title;
        body.appendChild(title);

        var list = document.createElement("ul");
        list.className = "pdm-legacy-card__files";

        category.files.forEach(function (file) {
          var item = document.createElement("li");
          var link = document.createElement("a");
          var icon = document.createElement("i");
          var label = document.createElement("span");

          link.href = file.url;
          link.target = "_blank";
          link.rel = "noopener";
          icon.className = "fas " + fileIcon(file.url);
          icon.setAttribute("aria-hidden", "true");
          label.textContent = file.name;

          link.appendChild(icon);
          link.appendChild(label);
          item.appendChild(link);
          list.appendChild(item);
        });

        if (!category.files.length) {
          var empty = document.createElement("p");
          empty.className = "pdm-legacy-card__empty";
          empty.textContent = "Nenhum arquivo disponível nesta etapa.";
          body.appendChild(empty);
        } else {
          body.appendChild(list);
        }

        card.appendChild(body);
        cards.appendChild(card);
      });

      source.dataset.pdmTransformed = "true";
      source.replaceChildren(cards);
      if (observer) observer.disconnect();
      return true;
    }

    sources.forEach(function (source) {
      if (transform(source)) return;
      var observer = new MutationObserver(function () {
        transform(source, observer);
      });
      observer.observe(source, { childList: true, subtree: true });
    });
  }

  function initializeDownloadFiles() {
    var source = document.querySelector(".pdm-download-source");
    if (!source) return;

    var legislation = [
      {
        match: "plano diretor",
        label: "Consultar Lei Complementar nº 97/2026",
        url: "https://leis.org/prefeitura/pr/campina-grande-do-sul/lei/lei-complementar/2026/97/lei-complementar-n-97-2026-dispoe-sobre-o-plano-diretor-municipal-objetivos-diretrizes-e-instrumentos-para-as-acoes-de-planejamento-no-municipio-de-campina-grande-do-sul-e-da-outras"
      },
      {
        match: "codigo de obras",
        label: "Consultar Lei Complementar nº 98/2026",
        url: "https://leis.org/prefeitura/pr/campina-grande-do-sul/lei/lei-complementar/2026/98/lei-complementar-n-98-2026-dispoe-sobre-o-codigo-de-obras-e-edificacoes-coe-do-municipio-de-campina-grande-do-sul-e-da-outras"
      },
      {
        match: "lei de uso e ocupacao do solo",
        label: "Consultar Lei Complementar nº 99/2026",
        url: "https://leis.org/prefeitura/pr/campina-grande-do-sul/lei/lei-complementar/2026/99/lei-complementar-n-99-2026-estabelece-diretrizes-e-regulamentacoes-para-o-uso-e-ocupacao-do-solo-no-municipio-e-da-outras"
      },
      {
        match: "parcelamento do solo urbano e condominios",
        label: "Consultar Lei Complementar nº 100/2026",
        url: "https://leis.org/prefeitura/pr/campina-grande-do-sul/lei/lei-complementar/2026/100/lei-complementar-n-100-2026-dispoe-sobre-o-parcelamento-do-solo-urbano-e-condominios-no-municipio-de-campina-grande-do-sul-e-da-outras"
      },
      {
        match: "codigo de posturas",
        label: "Consultar Lei Complementar nº 101/2026",
        url: "https://leis.org/prefeitura/pr/campina-grande-do-sul/lei/lei-complementar/2026/101/lei-complementar-n-101-2026-dispoe-sobre-o-codigo-de-posturas-no-municipio-de-campina-grande-do-sul-e-da-outras"
      }
    ];

    function normalize(value) {
      return (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    }

    function extensionFrom(url) {
      var cleanUrl = (url || "").split("?")[0];
      var extension = cleanUrl.indexOf(".") === -1 ? "arquivo" : cleanUrl.split(".").pop();
      return extension.toLowerCase();
    }

    function iconFrom(extension) {
      if (extension === "pdf") return "far fa-file-pdf pdm-file-icon--pdf";
      if (extension === "doc" || extension === "docx") return "far fa-file-word pdm-file-icon--word";
      if (extension === "xls" || extension === "xlsx") return "far fa-file-excel pdm-file-icon--excel";
      return "far fa-file-alt pdm-file-icon--default";
    }

    function transform(observer) {
      if (source.dataset.pdmTransformed === "true") return true;
      var rows = Array.prototype.slice.call(source.querySelectorAll("tbody tr"));
      var categories = [];

      rows.forEach(function (row) {
        var title = row.querySelector("td.text-info > a");
        var content = row.querySelector(".collapse");
        if (!title || !content) return;

        var normalizedTitle = normalize(title.textContent);
        var law = legislation.find(function (entry) {
          return normalizedTitle.indexOf(entry.match) !== -1;
        });
        var files = Array.prototype.slice.call(content.querySelectorAll("ul li a")).map(function (link) {
          return {
            name: link.textContent.trim(),
            url: link.getAttribute("href"),
            extension: extensionFrom(link.getAttribute("href"))
          };
        }).filter(function (file) {
          return file.name && file.url;
        });

        categories.push({
          title: title.textContent.trim(),
          files: files,
          law: law
        });
      });

      if (!categories.length) return false;

      var accordion = document.createElement("div");
      accordion.className = "pdm-modern-files";

      categories.forEach(function (category, index) {
        var card = document.createElement("article");
        var headingId = "pdm-download-heading-" + index;
        var panelId = "pdm-download-panel-" + index;
        card.className = "pdm-modern-files__category";

        var heading = document.createElement("h3");
        heading.id = headingId;

        var button = document.createElement("button");
        button.className = "pdm-modern-files__button";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", panelId);
        button.innerHTML =
          '<span><i class="fas fa-folder-open" aria-hidden="true"></i>' +
          '<span>' + category.title + '</span></span>' +
          '<i class="fas fa-chevron-down pdm-modern-files__chevron" aria-hidden="true"></i>';
        heading.appendChild(button);

        var panel = document.createElement("div");
        panel.id = panelId;
        panel.className = "pdm-modern-files__panel";
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", headingId);
        panel.hidden = true;

        category.files.forEach(function (file) {
          var link = document.createElement("a");
          link.className = "pdm-modern-file";
          link.href = file.url;
          link.target = "_blank";
          link.rel = "noopener";
          link.innerHTML =
            '<span class="pdm-modern-file__icon"><i class="' + iconFrom(file.extension) + '" aria-hidden="true"></i></span>' +
            '<span class="pdm-modern-file__copy"><strong>' + file.name + '</strong>' +
            '<small>' + file.extension.toUpperCase() + ' • Documento</small></span>' +
            '<i class="fas fa-download pdm-modern-file__action" aria-hidden="true"></i>';
          panel.appendChild(link);
        });

        if (category.law) {
          var lawLink = document.createElement("a");
          lawLink.className = "pdm-modern-file pdm-modern-file--law";
          lawLink.href = category.law.url;
          lawLink.target = "_blank";
          lawLink.rel = "noopener";
          lawLink.innerHTML =
            '<span class="pdm-modern-file__icon"><i class="fas fa-scale-balanced" aria-hidden="true"></i></span>' +
            '<span class="pdm-modern-file__copy"><strong>' + category.law.label + '</strong>' +
            '<small>Legislação on-line</small></span>' +
            '<i class="fas fa-arrow-up-right-from-square pdm-modern-file__action" aria-hidden="true"></i>';
          panel.appendChild(lawLink);
        }

        button.addEventListener("click", function () {
          var isOpen = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", String(!isOpen));
          panel.hidden = isOpen;
        });

        card.appendChild(heading);
        card.appendChild(panel);
        accordion.appendChild(card);
      });

      source.dataset.pdmTransformed = "true";
      source.replaceChildren(accordion);
      if (observer) observer.disconnect();
      return true;
    }

    if (transform()) return;
    var observer = new MutationObserver(function () { transform(observer); });
    observer.observe(source, { childList: true, subtree: true });
  }

  function initializePage() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".pdm-tabs [role='tab']"));
    var contentTabs = Array.prototype.slice.call(document.querySelectorAll(".pdm-content-tabs [role='tab']"));
    var contentTabsList = document.querySelector(".pdm-content-tabs__list");
    var contentTabsCard = document.querySelector(".pdm-tabs-card");
    var scrollLeftButton = document.querySelector(".pdm-tabs-scroll--left");
    var scrollRightButton = document.querySelector(".pdm-tabs-scroll--right");

    function selectTab(tab, moveFocus) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
      });
      if (moveFocus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[next], true);
      });
    });

    function selectContentTab(tab, moveFocus) {
      contentTabs.forEach(function (item) {
        var selected = item === tab;
        var panel = document.getElementById(item.getAttribute("aria-controls"));
        item.classList.toggle("ativo", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        if (panel) panel.hidden = !selected;
      });
      if (contentTabs.indexOf(tab) === 0 && contentTabsList) {
        contentTabsList.scrollTo({ left: 0, behavior: "auto" });
        if (scrollLeftButton) {
          scrollLeftButton.hidden = true;
          scrollLeftButton.disabled = true;
        }
      }
      if (window.innerWidth <= 991 && contentTabs.indexOf(tab) !== 0) {
        tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
      if (moveFocus) tab.focus();
    }

    function updateContentTabScrollButtons() {
      if (!contentTabsList || !scrollLeftButton || !scrollRightButton) return;
      var hasOverflow = contentTabsList.scrollWidth > contentTabsList.clientWidth + 5;
      scrollLeftButton.hidden = !hasOverflow || contentTabsList.scrollLeft < 10;
      scrollRightButton.hidden = !hasOverflow ||
        contentTabsList.scrollLeft + contentTabsList.clientWidth >= contentTabsList.scrollWidth - 10;
      scrollLeftButton.disabled = scrollLeftButton.hidden;
      scrollRightButton.disabled = scrollRightButton.hidden;
    }

    function scrollContentTabs(direction) {
      if (!contentTabsList) return;
      contentTabsList.scrollBy({
        left: direction * contentTabsList.clientWidth * 0.75,
        behavior: "smooth"
      });
    }

    if (scrollLeftButton) scrollLeftButton.addEventListener("click", function () { scrollContentTabs(-1); });
    if (scrollRightButton) scrollRightButton.addEventListener("click", function () { scrollContentTabs(1); });
    if (contentTabsList) contentTabsList.addEventListener("scroll", updateContentTabScrollButtons);
    window.addEventListener("resize", updateContentTabScrollButtons);
    updateContentTabScrollButtons();
    window.requestAnimationFrame(updateContentTabScrollButtons);

    contentTabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        selectContentTab(tab, false);
        if (contentTabs.indexOf(tab) === 0) {
          if (scrollLeftButton) {
            scrollLeftButton.hidden = true;
            scrollLeftButton.disabled = true;
          }
        } else {
          window.requestAnimationFrame(updateContentTabScrollButtons);
        }
        window.history.replaceState(null, "", "#" + tab.getAttribute("aria-controls"));
        if (window.innerWidth <= 991 && contentTabsCard) {
          var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({
            top: contentTabsCard.getBoundingClientRect().top + window.pageYOffset - 10,
            behavior: reducedMotion ? "auto" : "smooth"
          });
        }
      });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % contentTabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + contentTabs.length) % contentTabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = contentTabs.length - 1;
        else return;
        event.preventDefault();
        selectContentTab(contentTabs[next], true);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("a[href^='#']")).forEach(function (link) {
      link.addEventListener("click", function () {
        var target = document.querySelector(link.getAttribute("href"));
        var panel = target && (target.classList.contains("pdm-content-panel") ? target : target.closest(".pdm-content-panel"));
        if (!panel) return;
        var relatedTab = contentTabs.find(function (tab) {
          return tab.getAttribute("aria-controls") === panel.id;
        });
        if (relatedTab) selectContentTab(relatedTab, false);
      });
    });

    var planMobDocumentsButton = document.getElementById("btn-ver-docs-planmob");
    if (planMobDocumentsButton) {
      planMobDocumentsButton.addEventListener("click", function () {
        var planMobFolderButton = document.getElementById("pdm-folder-btn-docs-planmob");
        if (planMobFolderButton && planMobFolderButton.getAttribute("aria-expanded") !== "true") {
          planMobFolderButton.click();
        }
      });
    }

    var folderButtons = Array.prototype.slice.call(document.querySelectorAll(".pdm-folder__button"));
    folderButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var isOpen = button.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(button.getAttribute("aria-controls"));

        folderButtons.forEach(function (item) {
          item.setAttribute("aria-expanded", "false");
          var itemPanel = document.getElementById(item.getAttribute("aria-controls"));
          if (itemPanel) itemPanel.hidden = true;
        });

        if (!isOpen && panel) {
          button.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });

    if (window.location.hash) {
      var initialTarget = document.querySelector(window.location.hash);
      var initialPanel = initialTarget && (initialTarget.classList.contains("pdm-content-panel") ? initialTarget : initialTarget.closest(".pdm-content-panel"));
      var initialTab = initialPanel && contentTabs.find(function (tab) {
        return tab.getAttribute("aria-controls") === initialPanel.id;
      });
      if (initialTab) selectContentTab(initialTab, false);
    }

    initializeLegacyDocumentCards();
    initializeDownloadFiles();
  }

  var include = document.getElementById("pdm-page-include");
  if (include) {
    fetch("conteudo.html")
      .then(function (response) {
        if (!response.ok) throw new Error("Não foi possível carregar o conteúdo.");
        return response.text();
      })
      .then(function (html) {
        include.outerHTML = html;
        initializePage();
      })
      .catch(function () {
        include.innerHTML = '<div class="container py-5"><div class="alert alert-warning">Não foi possível carregar o conteúdo desta página.</div></div>';
      });
  } else {
    initializePage();
  }
}());
