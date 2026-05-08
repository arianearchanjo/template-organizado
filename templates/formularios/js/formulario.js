'use strict';

/**
 * JS — Portal Prefeitura de Campina Grande do Sul
 * Formulários Institucionais
 *
 * 1. Sistema de abas
 * 2. Upload — exibição do nome do arquivo
 * 3. Validação do formulário
 * 4. Limpeza de erros ao digitar
 * 5. Máscara CPF
 * 6. Máscara CEP
 * 7. Máscaras de telefone
 *
 * Acessibilidade (Fonte, Contraste, Atalhos, TTS, VLibras) agora é gerenciada 
 * centralmente por _global/js/acessibilidade-component.js
 */


// ── 1. SISTEMA DE ABAS ────────────────────────────────────────────────
(function () {
  var botoes  = document.querySelectorAll('.sec-tab-btn');
  var paineis = document.querySelectorAll('.sec-tab-painel');

  if (!botoes.length) return; /* Não é uma página com abas — encerra */

  botoes.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var alvo = btn.getAttribute('aria-controls');

      botoes.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-selected', 'false');
      });
      paineis.forEach(function (p) { p.classList.remove('ativo'); });

      btn.classList.add('ativo');
      btn.setAttribute('aria-selected', 'true');
      var painel = document.getElementById(alvo);
      if (painel) painel.classList.add('ativo');
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();


// ── 2. UPLOAD — exibição do nome do arquivo ────────────────────────────
(function () {
  var input = document.getElementById('anexo-input');
  if (!input) return;

  /** Atualiza o texto exibido abaixo do campo de upload. */
  input.addEventListener('change', function () {
    var wrap = document.getElementById('nome-arquivo');
    if (!wrap) return;
    if (this.files && this.files[0]) {
      wrap.textContent = '📎 ' + this.files[0].name;
      wrap.style.display = 'block';
    } else {
      wrap.textContent = '';
      wrap.style.display = 'none';
    }
  });
})();


// ── 3. VALIDAÇÃO DO FORMULÁRIO ─────────────────────────────────────────
(function () {
  var form = document.getElementById('pi-form-ouvidoria');
  if (!form) return;

  /** IDs dos campos obrigatórios, na ordem de leitura do formulário. */
  var camposObrigatorios = [
    'assunto',
    'nome',
    'cpf',
    'email',
    'celular',
    'cep',
    'logradouro',
    'numero',
    'bairro',
    'cidade',
    'area',
    'titulo-solicitacao',
    'descricao'
  ];

  /** Marca o campo e seu .form-group with estado de erro. */
  function marcarErro(el) {
    var grp = el.closest('.form-group');
    if (!grp) return;
    grp.classList.add('has-error');
    el.classList.add('input-error');
    el.classList.remove('input-success');
  }

  /** Remove o estado de erro e marca sucesso no campo. */
  function marcarSucesso(el) {
    var grp = el.closest('.form-group');
    if (!grp) return;
    grp.classList.remove('has-error');
    el.classList.remove('input-error');
    el.classList.add('input-success');
  }

  /**
   * Exibe a mensagem de feedback (sucesso ou erro) no topo do formulário.
   * @param {'sucesso'|'erro'} tipo
   * @param {string}           mensagem
   */
  function exibirFeedback(tipo, mensagem) {
    var fb = document.getElementById('form-feedback');
    if (!fb) return;
    fb.className = 'form-alert ' + (tipo === 'sucesso' ? 'alert-success' : 'alert-error');
    fb.style.display = 'block';
    fb.textContent = mensagem;
    fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valido = true;

    camposObrigatorios.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        marcarErro(el);
        valido = false;
      } else {
        marcarSucesso(el);
      }
    });

    if (!valido) {
      exibirFeedback('erro', '⚠️ Por favor, preencha todos os campos obrigatórios antes de enviar.');
    } else {
      exibirFeedback('sucesso', '✅ Manifestação enviada com sucesso! Você receberá uma confirmação por e-mail.');
      form.reset();
      form.querySelectorAll('.input-success').forEach(function (el) {
        el.classList.remove('input-success');
      });
    }
  });
})();


// ── 4. LIMPEZA DE ERROS AO DIGITAR ────────────────────────────────────
(function () {
  var form = document.getElementById('pi-form-ouvidoria');
  if (!form) return;

  form.querySelectorAll('.form-control').forEach(function (el) {
    /** Remove o estado de erro assim que o usuário começa a corrigir o campo. */
    el.addEventListener('input', function () {
      if (!this.value.trim()) return;
      var grp = this.closest('.form-group');
      if (grp) grp.classList.remove('has-error');
      this.classList.remove('input-error');
    });
  });
})();


// ── 5. MÁSCARA CPF ─────────────────────────────────────────────────────
(function () {
  var cpf = document.getElementById('cpf');
  if (!cpf) return;

  /** Formata a entrada como 000.000.000-00 em tempo real. */
  cpf.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/,       '$1.$2')
         .replace(/(\d{3})(\d)/,       '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
  });
})();


// ── 6. MÁSCARA CEP ─────────────────────────────────────────────────────
(function () {
  var cep = document.getElementById('cep');
  if (!cep) return;

  /** Formata a entrada como 00000-000 em tempo real. */
  cep.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '').substring(0, 8);
    this.value = v.replace(/(\d{5})(\d)/, '$1-$2');
  });
})();


// ── 7. MÁSCARAS DE TELEFONE ───────────────────────────────────────────
(function () {
  /**
   * Aplica máscara de telefone a um campo pelo ID.
   * Detecta automaticamente se é celular (9 dígitos) ou fixo (8 dígitos).
   * @param {string} id
   */
  function mascaraTelefone(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').substring(0, 11);
      if (v.length <= 10) {
        // Fixo: (41) 0000-0000
        v = v.replace(/(\d{2})(\d)/,      '($1) $2')
             .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
      } else {
        // Celular: (41) 00000-0000
        v = v.replace(/(\d{2})(\d)/,      '($1) $2')
             .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
      }
      this.value = v;
    });
  }

  mascaraTelefone('telefone-fixo');
  mascaraTelefone('celular');
})();
