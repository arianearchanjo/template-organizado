(function () {
  "use strict";
  function init(root) {
    var source = root.querySelector(".ct-files-source");
    if (!source) return;
    function done() {
      var links = source.querySelectorAll("#tbl-file a[href]");
      if (!links.length) return false;
      links.forEach(function (link) {
        link.target = "_blank";
        link.rel = "noopener";
      });
      return true;
    }
    if (done()) return;
    var observer = new MutationObserver(function () {
      if (done()) observer.disconnect();
    });
    observer.observe(source, { childList: true, subtree: true });
  }
  function load() {
    var mount = document.getElementById("ct-page-include");
    if (!mount) return;
    fetch("conteudo.html")
      .then(function (response) {
        if (!response.ok) throw Error();
        return response.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        init(mount);
      })
      .catch(function () {
        mount.innerHTML =
          '<div class="container py-5">Nao foi possivel carregar o conteudo.</div>';
      });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", load, { once: true })
    : load();
})();
