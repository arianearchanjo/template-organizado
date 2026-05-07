// component/search-component.js
class MeuSearch extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const base = typeof getBasePath === 'function' ? getBasePath() : "";
    this.innerHTML = `
      <header id="header" style="background: #fff; border-bottom: 1px solid #eee; padding: 15px 0; display: block !important;">
        <div class="container">
          <div class="row align-items-center" style="display: flex; flex-wrap: wrap;">
            <div class="col-md-4">
              <a href="${base}pages/home/index.html">
                <img src="${base}_global/img/global/logo.png" style="max-width: 250px;">
              </a>
            </div>
            <div class="col-md-8">
              <form action="#" class="input-group">
                <input type="text" class="form-control" placeholder="O que você procura?">
                <div class="input-group-append">
                  <button type="submit" class="btn btn-success"><i class="fas fa-search"></i></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>
    `;
  }
}

// Isso garante que o elemento seja registrado mesmo que o script demore
if (!customElements.get('meu-search')) {
  customElements.define('meu-search', MeuSearch);
}

