'use strict';
/**
 * index.js — Portal da Prefeitura de Campina Grande do Sul
 * Organização:
 *   1. Autocomplete da busca
 *   2. Widget de Clima (Open-Meteo, sem API key)
 *   3. Acordeão de Transparência
 *   4. Filtro de Perfis de Acesso (grid de serviços)
 *   5. Acessibilidade eMAG — Controle de Fonte + Alto Contraste
 *   6. Atalhos de teclado eMAG (Alt+0 / Alt+1 / Alt+2 / Alt+3)
 *   7. Text-to-Speech (botão único inteligente)
 *   8. VLibras (inicialização)
 */
// ── 1. WIDGET DE CLIMA ───────────────────────────────────────────────────────
(function () {
  var LAT = -25.3072;
  var LON = -49.0539;

  var WMO = {
    0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Névoa', 48: 'Névoa com geada',
    51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa intensa',
    61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
    71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve forte',
    80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
    95: 'Tempestade', 96: 'Tempestade c/ granizo', 99: 'Tempestade forte'
  };

  var ICON = {
    0: 'fa-sun', 1: 'fa-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog',
    51: 'fa-cloud-drizzle', 53: 'fa-cloud-drizzle', 55: 'fa-cloud-drizzle',
    61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-showers-heavy',
    71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
    80: 'fa-cloud-rain', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
    95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt'
  };

  function renderClima(temp, wind, umid, code) {
    var desc = WMO[code] || 'Tempo variável';
    var icon = ICON[code] || 'fa-cloud';
    var el = document.getElementById('clima-info');
    if (!el) return;
    el.innerHTML =
      '<i class="fas ' + icon + ' clima-icon"></i>' +
      '<span class="clima-temp">' + temp + '<sup>°C</sup></span>' +
      '<span class="clima-desc">' + desc + '</span>' +
      '<div class="clima-sep"></div>' +
      '<div class="clima-extras">' +
        '<span><i class="fas fa-wind"></i>' + wind + ' km/h</span>' +
        '<span><i class="fas fa-tint"></i>' + umid + '% umidade</span>' +
      '</div>';
  }

  function erroClima() {
    var el = document.getElementById('clima-info');
    if (el) {
      el.innerHTML = '<span class="clima-loader"><i class="fas fa-exclamation-circle"></i> Clima indisponível</span>';
    }
  }

  var url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + LAT +
    '&longitude=' + LON +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&forecast_days=1' +
    '&timezone=America%2FSao_Paulo';

  if (typeof fetch !== 'undefined') {
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var cur  = data.current;
        var temp = Math.round(cur.temperature_2m);
        var wind = Math.round(cur.wind_speed_10m);
        var umid = cur.relative_humidity_2m;
        var code = cur.weather_code;
        renderClima(temp, wind, umid, code);
      })
      .catch(erroClima);
  } else {
    erroClima();
  }
})();


// ── 3. ACORDEÃO DE TRANSPARÊNCIA ────────────────────────────────────────────
function toggleTransp(btn) {
  var grupo = btn.closest('.transp-grupo');
  var grid  = grupo.querySelector('.transp-grid');
  var seta  = btn.querySelector('.transp-seta');
  var aberto = grupo.classList.contains('open');

  if (aberto) {
    grid.style.display = 'none';
    seta.classList.replace('fa-chevron-up', 'fa-chevron-down');
    grupo.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    grid.style.display = 'flex';
    seta.classList.replace('fa-chevron-down', 'fa-chevron-up');
    grupo.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}


// ── 4. FILTRO DE PERFIS DE ACESSO ────────────────────────────────────────────
(function () {
  var btnsPerfil = document.querySelectorAll('.perfil-btn');
  var gridItens  = document.querySelectorAll('#grid-acesso-rapido .grid-item');

  if (!btnsPerfil.length) return;

  function filtrar(perfil) {
    gridItens.forEach(function (col) {
      var perfis = (col.getAttribute('data-perfis') || '').split(' ');
      if (perfis.indexOf(perfil) !== -1) {
        col.classList.remove('perfil-oculto');
      } else {
        col.classList.add('perfil-oculto');
      }
    });
  }

  btnsPerfil.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var perfil = btn.getAttribute('data-perfil');

      btnsPerfil.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-expanded', 'false');
      });

      btn.classList.add('ativo');
      btn.setAttribute('aria-expanded', 'true');

      filtrar(perfil);
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  filtrar('todos');
})();