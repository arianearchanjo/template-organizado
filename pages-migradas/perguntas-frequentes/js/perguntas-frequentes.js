(function () {
  var input = document.getElementById('pi-faq-input');
  var lista = document.getElementById('pi-faq-lista');
  var itens = lista.querySelectorAll('.pi-faq-item');
  var vazio = document.getElementById('pi-faq-vazio');
  var termoSpan = document.getElementById('pi-faq-termo');
  var contador = document.getElementById('pi-faq-visivel');
  var btnLimpar = document.getElementById('pi-faq-btn-limpar');

  function normalizar(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function fecharItem(item) {
    item.classList.remove('aberto');
    var btn = item.querySelector('.pi-faq-pergunta');
    var resp = item.querySelector('.pi-faq-resposta');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (resp) resp.hidden = true;
  }

  function abrirItem(item) {
    item.classList.add('aberto');
    var btn = item.querySelector('.pi-faq-pergunta');
    var resp = item.querySelector('.pi-faq-resposta');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (resp) resp.hidden = false;
  }

  function filtrar() {
    var termo = input.value.trim();
    var termNorm = normalizar(termo);
    var visivel = 0;

    itens.forEach(function (item) {
      var pergunta = item.querySelector('.pi-faq-pergunta span:first-child');
      var resposta = item.querySelector('.pi-faq-resposta');
      var textoPerg = pergunta ? normalizar(pergunta.textContent) : '';
      var textoResp = resposta ? normalizar(resposta.textContent) : '';

      if (termNorm === '' || textoPerg.indexOf(termNorm) !== -1 || textoResp.indexOf(termNorm) !== -1) {
        item.classList.remove('oculto');
        visivel++;
      } else {
        item.classList.add('oculto');
        if (item.classList.contains('aberto')) {
          fecharItem(item);
        }
      }
    });

    contador.textContent = visivel;

    if (visivel === 0 && termNorm !== '') {
      vazio.style.display = 'block';
      termoSpan.textContent = termo;
      lista.style.display = 'none';
    } else {
      vazio.style.display = 'none';
      lista.style.display = '';
    }

    btnLimpar.style.display = termNorm !== '' ? 'flex' : 'none';
  }

  itens.forEach(function (item) {
    var btn = item.querySelector('.pi-faq-pergunta');

    btn.addEventListener('click', function () {
      if (item.classList.contains('aberto')) {
        fecharItem(item);
      } else {
        abrirItem(item);
      }
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  input.addEventListener('input', filtrar);

  btnLimpar.addEventListener('click', function () {
    input.value = '';
    filtrar();
    input.focus();
  });
})();