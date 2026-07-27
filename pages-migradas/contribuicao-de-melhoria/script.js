(function () {
  "use strict";

  function extensionFrom(url) {
    var clean = (url || "").split("?")[0];
    if (clean.indexOf(".") === -1) return "arquivo";
    return clean.split(".").pop().toLowerCase();
  }

  function iconFrom(extension) {
    if (extension === "pdf") return "far fa-file-pdf cm-file__icon--pdf";
    if (extension === "doc" || extension === "docx") return "far fa-file-word cm-file__icon--word";
    if (extension === "xls" || extension === "xlsx") return "far fa-file-excel cm-file__icon--excel";
    return "far fa-file-alt cm-file__icon--default";
  }

  function yearFrom(title) {
    var match = (title || "").match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : "Outros";
  }

  function initialize() {
    var source = document.querySelector(".cm-file-source");
    if (!source) return;

    function transform(observer) {
      if (source.dataset.cmTransformed === "true") return true;

      var rows = Array.prototype.slice.call(source.querySelectorAll("tbody tr"));
      var categories = rows.map(function (row) {
        var titleLink = row.querySelector("td.text-info > a");
        var content = row.querySelector(".collapse");
        if (!titleLink || !content) return null;

        var title = titleLink.textContent.trim();
        var files = Array.prototype.slice.call(content.querySelectorAll("ul li a")).map(function (link) {
          var url = link.getAttribute("href");
          return {
            name: link.textContent.trim(),
            url: url,
            extension: extensionFrom(url)
          };
        }).filter(function (file) {
          return file.name && file.url;
        });

        return {
          title: title,
          year: yearFrom(title),
          files: files
        };
      }).filter(Boolean);

      if (!categories.length) return false;

      var years = categories.map(function (category) {
        return category.year;
      }).filter(function (year, index, list) {
        return list.indexOf(year) === index;
      }).sort(function (a, b) {
        if (a === "Outros") return 1;
        if (b === "Outros") return -1;
        return Number(b) - Number(a);
      });

      var fragment = document.createDocumentFragment();
      var filter = document.createElement("div");
      filter.className = "cm-filter";
      filter.setAttribute("aria-label", "Filtrar documentos por ano");
      filter.innerHTML = '<span class="cm-filter__label"><i class="fas fa-filter" aria-hidden="true"></i>Filtrar por ano:</span>';

      var allButton = document.createElement("button");
      allButton.type = "button";
      allButton.className = "cm-filter__button is-active";
      allButton.dataset.year = "all";
      allButton.textContent = "Todos";
      filter.appendChild(allButton);

      years.forEach(function (year) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cm-filter__button";
        button.dataset.year = year;
        button.textContent = year;
        filter.appendChild(button);
      });

      var filesContainer = document.createElement("div");
      filesContainer.className = "cm-files";

      categories.forEach(function (category, index) {
        var card = document.createElement("article");
        var headingId = "cm-heading-" + index;
        var panelId = "cm-panel-" + index;
        card.className = "cm-category";
        card.dataset.year = category.year;

        var heading = document.createElement("h3");
        heading.id = headingId;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cm-category__button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", panelId);

        var identity = document.createElement("span");
        identity.className = "cm-category__identity";
        identity.innerHTML = '<i class="fas fa-folder-open" aria-hidden="true"></i>';
        var title = document.createElement("span");
        title.textContent = category.title;
        identity.appendChild(title);

        var meta = document.createElement("span");
        meta.className = "cm-category__meta";
        var year = document.createElement("span");
        year.className = "cm-category__year";
        year.textContent = category.year;
        var chevron = document.createElement("i");
        chevron.className = "fas fa-chevron-down cm-category__chevron";
        chevron.setAttribute("aria-hidden", "true");
        meta.appendChild(year);
        meta.appendChild(chevron);
        button.appendChild(identity);
        button.appendChild(meta);
        heading.appendChild(button);

        var panel = document.createElement("div");
        panel.id = panelId;
        panel.className = "cm-category__panel";
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", headingId);
        panel.hidden = true;

        category.files.forEach(function (file) {
          var link = document.createElement("a");
          link.className = "cm-file";
          link.href = file.url;
          link.target = "_blank";
          link.rel = "noopener";

          var icon = document.createElement("span");
          icon.className = "cm-file__icon";
          icon.innerHTML = '<i class="' + iconFrom(file.extension) + '" aria-hidden="true"></i>';
          var copy = document.createElement("span");
          copy.className = "cm-file__copy";
          var name = document.createElement("strong");
          name.textContent = file.name;
          var type = document.createElement("small");
          type.textContent = file.extension.toUpperCase() + " • Documento";
          copy.appendChild(name);
          copy.appendChild(type);
          var download = document.createElement("i");
          download.className = "fas fa-download cm-file__download";
          download.setAttribute("aria-hidden", "true");

          link.appendChild(icon);
          link.appendChild(copy);
          link.appendChild(download);
          panel.appendChild(link);
        });

        button.addEventListener("click", function () {
          var open = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", String(!open));
          panel.hidden = open;
        });

        card.appendChild(heading);
        card.appendChild(panel);
        filesContainer.appendChild(card);
      });

      function applyFilter(year, activeButton) {
        Array.prototype.slice.call(filter.querySelectorAll(".cm-filter__button")).forEach(function (button) {
          button.classList.toggle("is-active", button === activeButton);
        });
        Array.prototype.slice.call(filesContainer.querySelectorAll(".cm-category")).forEach(function (card) {
          card.hidden = year !== "all" && card.dataset.year !== year;
        });
      }

      Array.prototype.slice.call(filter.querySelectorAll(".cm-filter__button")).forEach(function (button) {
        button.addEventListener("click", function () {
          applyFilter(button.dataset.year, button);
        });
      });

      fragment.appendChild(filter);
      fragment.appendChild(filesContainer);
      source.dataset.cmTransformed = "true";
      source.replaceChildren(fragment);
      if (observer) observer.disconnect();
      return true;
    }

    if (transform()) return;
    var observer = new MutationObserver(function () {
      transform(observer);
    });
    observer.observe(source, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
}());

