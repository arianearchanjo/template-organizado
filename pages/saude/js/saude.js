(function () {
  "use strict";

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".saude-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".saude-painel"));

  function activate(tab, focus, updateHash) {
    var panelId = tab.getAttribute("aria-controls");

    tabs.forEach(function (item) {
      var selected = item === tab;
      item.classList.toggle("ativo", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(function (panel) {
      var active = panel.id === panelId;
      panel.classList.toggle("ativo", active);
      panel.hidden = !active;
    });

    /*
     * Alguns carregadores do portal só processam componentes dinâmicos quando
     * a aba se torna visível. Os eventos permitem que eles refaçam a leitura.
     */
    if (panelId === "painel-boletins") {
      window.dispatchEvent(new Event("resize"));
      document.dispatchEvent(new CustomEvent("spweb:content-visible", {
        detail: { panel: panelId, category: 50 }
      }));
    }

    if (focus) tab.focus();
    if (updateHash && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + panelId);
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activate(tab, false, true); });
    tab.addEventListener("keydown", function (event) {
      var nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (typeof nextIndex === "number") {
        event.preventDefault();
        activate(tabs[nextIndex], true, true);
      }
    });
  });

  if (window.location.hash) {
    var hashTab = tabs.find(function (tab) {
      return "#" + tab.getAttribute("aria-controls") === window.location.hash;
    });
    if (hashTab) activate(hashTab, false, false);
  }

  var search = document.getElementById("docs-search");
  var category = document.getElementById("docs-category");

  function filterDocuments() {
    var query = search ? search.value.toLocaleLowerCase("pt-BR").trim() : "";
    var selectedCategory = category ? category.value : "";
    var container = document.querySelector('[data-category="47"]');
    if (!container) return;

    Array.prototype.forEach.call(container.children, function (item) {
      var text = item.textContent.toLocaleLowerCase("pt-BR");
      var itemCategory = item.getAttribute("data-category-name") || "";
      item.hidden = text.indexOf(query) === -1 ||
        (selectedCategory && itemCategory !== selectedCategory);
    });
  }

  if (search) search.addEventListener("input", filterDocuments);
  if (category) category.addEventListener("change", filterDocuments);
})();
