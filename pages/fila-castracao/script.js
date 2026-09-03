'use strict';

/**
 * JS — Portal Prefeitura de Campina Grande do Sul
 * Ficha de Pré-Cadastro — Castra Móvel
 *
 * 1. Sistema de abas
 * 2. Upload — exibição do nome do arquivo
 * 3. Validação do formulário
 * 4. Limpeza de erros ao digitar
 * 5. Máscara de Data
 * 6. Máscara de CPF
 * 7. Máscara de Telefone
 * 8. Campos dinâmicos de Nome/Idade por animal
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


// ── 3. VALIDAÇÃO DO FORMULÁRIO + ENVIO PARA A API ──────────────────────
(function () {
  var form = document.getElementById('pi-form-castra-movel');
  if (!form) return;

  /**
   * URL base da API pública de pré-cadastro.
   * Deixe em branco ('') se este site e a API estiverem no MESMO domínio
   * (o front chamará o caminho relativo /api/castration).
   * Caso a API esteja em outro domínio (ex.: painel administrativo),
   * defina a URL completa aqui, ex.: 'https://sistema.pmcgs.pr.gov.br'
   */
  var API_BASE_URL = '';
  var API_ENDPOINT = API_BASE_URL.replace(/\/$/, '') + '/api/castration';

  /** IDs dos campos obrigatórios, na ordem de leitura do formulário. */
  var camposObrigatorios = [
    'data',
    'nome',
    'endereco',
    'bairro',
    'telefone',
    'cpf'
  ];

  /** IDs dos campos numéricos de quantidade de animais (cão + gato). */
  var camposQuantidadeAnimais = [
    'cao-machos',
    'cao-femeas',
    'gato-machos',
    'gato-femeas'
  ];

  /** Marca o campo e seu .form-group com estado de erro. */
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

  /**
   * Exibe ou oculta a mensagem de feedback específica da seção de animais.
   * @param {boolean} mostrar
   */
  function exibirFeedbackAnimais(mostrar) {
    var fb = document.getElementById('animais-feedback');
    if (!fb) return;
    if (mostrar) {
      fb.className = 'form-alert alert-error';
      fb.style.display = 'block';
      fb.textContent = ' Informe a quantidade de pelo menos um animal (cão e/ou gato).';
    } else {
      fb.style.display = 'none';
    }
  }

  /** Soma as quantidades informadas para cão e gato. */
  function totalAnimaisInformado() {
    var total = 0;
    camposQuantidadeAnimais.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var valor = parseInt(el.value, 10);
      if (!isNaN(valor) && valor > 0) total += valor;
    });
    return total;
  }

  /** Lê o valor inteiro de um campo de quantidade (retorna 0 se vazio/inválido). */
  function lerQuantidade(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var valor = parseInt(el.value, 10);
    return isNaN(valor) || valor < 0 ? 0 : valor;
  }

  /** Remove tudo que não for dígito de uma string (usado para o CPF). */
  function apenasDigitos(v) {
    return (v || '').replace(/\D/g, '');
  }

  /** Converte uma data digitada como DD/MM/AAAA para o formato ISO AAAA-MM-DD esperado pela API. */
  function converterDataParaISO(dataBR) {
    var partes = (dataBR || '').split('/');
    if (partes.length !== 3) return '';
    var dia = partes[0], mes = partes[1], ano = partes[2];
    if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return '';
    return ano + '-' + mes + '-' + dia;
  }

  /**
   * Percorre os blocos de Nome/Idade gerados dinamicamente para uma espécie
   * (cão ou gato) e retorna os nomes e idades preenchidos, já concatenados.
   * @param {string} prefixo 'cao' ou 'gato'
   */
  function coletarAnimais(prefixo) {
    var lista = document.getElementById(prefixo + '-animais-lista');
    var nomes = [];
    var idades = [];
    if (lista) {
      lista.querySelectorAll('input[id*="-nome-"]').forEach(function (el) {
        var v = el.value.trim();
        if (v) nomes.push(v);
      });
      lista.querySelectorAll('input[id*="-idade-"]').forEach(function (el) {
        var v = el.value.trim();
        if (v) idades.push(v);
      });
    }
    return { nomes: nomes.join(', '), idades: idades.join(', ') };
  }

  /** Monta o payload no formato aceito por POST /api/castration. */
  function montarPayload() {
    var caoMachos  = lerQuantidade('cao-machos');
    var caoFemeas  = lerQuantidade('cao-femeas');
    var gatoMachos = lerQuantidade('gato-machos');
    var gatoFemeas = lerQuantidade('gato-femeas');

    var animaisCao  = coletarAnimais('cao');
    var animaisGato = coletarAnimais('gato');

    var observacoesEl = document.getElementById('observacoes');

    return {
      tutorName:        document.getElementById('nome').value.trim(),
      address:          document.getElementById('endereco').value.trim(),
      neighborhood:     document.getElementById('bairro').value.trim(),
      contactPhone:     document.getElementById('telefone').value.trim(),
      cpf:              apenasDigitos(document.getElementById('cpf').value),
      registrationDate: converterDataParaISO(document.getElementById('data').value.trim()),
      dogQuantity:      caoMachos + caoFemeas,
      dogMales:         caoMachos,
      dogFemales:       caoFemeas,
      dogAge:           animaisCao.idades,
      dogName:          animaisCao.nomes,
      catQuantity:      gatoMachos + gatoFemeas,
      catMales:         gatoMachos,
      catFemales:       gatoFemeas,
      catAge:           animaisGato.idades,
      catName:          animaisGato.nomes,
      observations:     observacoesEl ? observacoesEl.value.trim() : ''
    };
  }

  /** Envia o pré-cadastro para a API pública. Retorna a Promise do fetch já tratada. */
  function enviarPreCadastro(payload) {
    return fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (resposta) {
      return resposta.json().catch(function () { return {}; }).then(function (corpo) {
        if (!resposta.ok || corpo.success === false) {
          var mensagem = (corpo && corpo.error) ? corpo.error : 'Não foi possível enviar o pré-cadastro.';
          throw new Error(typeof mensagem === 'string' ? mensagem : 'Não foi possível enviar o pré-cadastro.');
        }
        return corpo;
      });
    });
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

    var temAnimal = totalAnimaisInformado() > 0;
    exibirFeedbackAnimais(!temAnimal);
    if (!temAnimal) valido = false;

    var dataEl = document.getElementById('data');
    if (dataEl && dataEl.value.trim() && !converterDataParaISO(dataEl.value.trim())) {
      marcarErro(dataEl);
      valido = false;
    }

    if (!valido) {
      exibirFeedback('erro', ' Por favor, preencha todos os campos obrigatórios antes de enviar.');
      return;
    }

    var botaoEnviar = document.querySelector('.btn-enviar');
    var textoOriginalBotao = botaoEnviar ? botaoEnviar.innerHTML : '';
    if (botaoEnviar) {
      botaoEnviar.disabled = true;
      botaoEnviar.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';
    }

    enviarPreCadastro(montarPayload())
      .then(function () {
        exibirFeedback('sucesso', ' Pré-cadastro enviado com sucesso! Você receberá uma confirmação por e-mail ou telefone.');
        form.reset();
        form.querySelectorAll('.input-success').forEach(function (el) {
          el.classList.remove('input-success');
        });
        document.querySelectorAll('.form-animal-lista').forEach(function (lista) {
          lista.innerHTML = '';
        });
      })
      .catch(function (erro) {
        exibirFeedback('erro', ' ' + (erro && erro.message ? erro.message : 'Ocorreu um erro ao enviar o pré-cadastro. Tente novamente.'));
      })
      .finally(function () {
        if (botaoEnviar) {
          botaoEnviar.disabled = false;
          botaoEnviar.innerHTML = textoOriginalBotao;
        }
      });
  });
})();


// ── 4. LIMPEZA DE ERROS AO DIGITAR ────────────────────────────────────
(function () {
  var form = document.getElementById('pi-form-castra-movel');
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

  /** Some com o aviso de "nenhum animal informado" assim que o usuário digitar algo. */
  ['cao-machos', 'cao-femeas', 'gato-machos', 'gato-femeas'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      var fb = document.getElementById('animais-feedback');
      if (fb) fb.style.display = 'none';
    });
  });
})();


// ── 5. MÁSCARA DE DATA ─────────────────────────────────────────────────
(function () {
  var data = document.getElementById('data');
  if (!data) return;

  /** Formata a entrada como 00/00/0000 em tempo real. */
  data.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '').substring(0, 8);
    v = v.replace(/(\d{2})(\d)/, '$1/$2')
         .replace(/(\d{2})(\d)/, '$1/$2');
    this.value = v;
  });
})();


// ── 6. MÁSCARA DE CPF ──────────────────────────────────────────────────
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


// ── 7. MÁSCARA DE TELEFONE ─────────────────────────────────────────────
(function () {
  var telefone = document.getElementById('telefone');
  if (!telefone) return;

  /** Formata a entrada como (41) 0000-0000 ou (41) 00000-0000, conforme a quantidade de dígitos. */
  telefone.addEventListener('input', function () {
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
})();


// ── 8. CAMPOS DINÂMICOS DE NOME/IDADE POR ANIMAL ────────────────────────
(function () {
  /** Uma entrada por espécie: prefixo dos IDs e rótulo exibido no título do bloco. */
  var especies = [
    { prefixo: 'cao',  rotulo: 'Cão'  },
    { prefixo: 'gato', rotulo: 'Gato' }
  ];

  /** Uma entrada por sexo: sufixo usado nos IDs e rótulo exibido no título do bloco. */
  var sexos = [
    { chave: 'macho', rotulo: 'Macho' },
    { chave: 'femea', rotulo: 'Fêmea' }
  ];

  /** Limite de segurança para evitar geração excessiva de campos por sexo. */
  var LIMITE_ANIMAIS = 20;

  especies.forEach(function (especie) {
    var camposQtd = {
      macho: document.getElementById(especie.prefixo + '-machos'),
      femea: document.getElementById(especie.prefixo + '-femeas')
    };
    var lista = document.getElementById(especie.prefixo + '-animais-lista');
    if (!camposQtd.macho || !camposQtd.femea || !lista) return;

    /** Monta o bloco de campos (Nome + Idade) de um animal individual, já identificado por sexo. */
    function criarBlocoAnimal(sexo, indice) {
      var idNome  = especie.prefixo + '-' + sexo.chave + '-nome-'  + indice;
      var idIdade = especie.prefixo + '-' + sexo.chave + '-idade-' + indice;

      var wrap = document.createElement('div');
      wrap.className = 'form-animal-item';
      wrap.setAttribute('data-sexo', sexo.chave);
      wrap.innerHTML =
        '<div class="form-animal-item-titulo">' +
          especie.rotulo + ' ' + indice +
          '<span class="form-animal-item-badge form-animal-item-badge-' + sexo.chave + '">' +
            sexo.rotulo +
          '</span>' +
        '</div>' +
        '<div class="row">' +
          '<div class="col-6">' +
            '<div class="form-group">' +
              '<label for="' + idNome + '">Nome</label>' +
              '<input type="text" id="' + idNome + '" name="' + idNome +
                '" class="form-control" placeholder="Nome do animal">' +
            '</div>' +
          '</div>' +
          '<div class="col-6">' +
            '<div class="form-group">' +
              '<label for="' + idIdade + '">Idade</label>' +
              '<input type="text" id="' + idIdade + '" name="' + idIdade +
                '" class="form-control" placeholder="Ex: 2 anos">' +
            '</div>' +
          '</div>' +
        '</div>';
      return wrap;
    }

    /**
     * Recria, para um único sexo, a quantidade de blocos conforme a quantidade informada.
     * Remove apenas os blocos excedentes desse sexo (do final) e adiciona os que faltam,
     * preservando os valores já digitados nos blocos existentes — inclusive os do outro sexo.
     */
    function atualizarListaSexo(sexo) {
      var el = camposQtd[sexo.chave];
      var valor = parseInt(el.value, 10);
      if (isNaN(valor) || valor < 0) valor = 0;
      if (valor > LIMITE_ANIMAIS) valor = LIMITE_ANIMAIS;

      var blocosSexo = lista.querySelectorAll('[data-sexo="' + sexo.chave + '"]');

      while (blocosSexo.length > valor) {
        lista.removeChild(blocosSexo[blocosSexo.length - 1]);
        blocosSexo = lista.querySelectorAll('[data-sexo="' + sexo.chave + '"]');
      }
      for (var i = blocosSexo.length + 1; i <= valor; i++) {
        lista.appendChild(criarBlocoAnimal(sexo, i));
      }
    }

    sexos.forEach(function (sexo) {
      camposQtd[sexo.chave].addEventListener('input', function () {
        atualizarListaSexo(sexo);
      });
      atualizarListaSexo(sexo); // estado inicial (ex.: valores pré-preenchidos)
    });
  });
})();