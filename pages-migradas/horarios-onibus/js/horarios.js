const linhasPorCidade = {
  campina_grande_do_sul: [
    { codigo: 'N24', nome: 'ÁREA INDUSTRIAL CGS' },
    { codigo: 'N61', nome: 'CAMPINA GRANDE DO SUL/GUADALUPE' },
    { codigo: 'N72', nome: 'EUGÊNIA MARIA/GUADALUPE' },
    { codigo: 'N01', nome: 'H.CARON/ATUBA (VIA JD.PAULISTA-Q.BARRAS)' },
    { codigo: 'N12', nome: 'JD. CECCON' },
    { codigo: 'I33', nome: 'JD. PAULISTA / GUARAITUBA' },
    { codigo: 'N62', nome: 'JD.PAULISTA/GUADALUPE' },
    { codigo: 'N23', nome: 'JOÃO PAULO II' }
  ]
};

// Seletores
const selectCidade = document.getElementById('cidade');
const selectLinha = document.getElementById('linha');
const selectDia = document.getElementById('dia');
const btnBuscar = document.getElementById('btnBuscar');
const resultado = document.getElementById('resultado');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (selectCidade) {
        selectCidade.value = 'campina_grande_do_sul';
        atualizaLinhas();
        selectCidade.disabled = true;
    }
    
    // Configura evento de clique se o botão existir
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarHorarios);
    }
});

function atualizaLinhas() {
  const cidade = 'campina_grande_do_sul';
  if (!selectLinha) return;
  
  selectLinha.innerHTML = '<option value="">Selecione a linha</option>';

  linhasPorCidade[cidade].forEach(linhaObj => {
    const option = document.createElement('option');
    option.value = linhaObj.codigo;               // código da linha
    option.textContent = `${linhaObj.codigo} - ${linhaObj.nome}`;
    selectLinha.appendChild(option);
  });
}

function buscarHorarios() {
  const cidade = selectCidade ? selectCidade.value : 'campina_grande_do_sul';
  const linha = selectLinha ? selectLinha.value : '';
  const dia = selectDia ? selectDia.value : '';

  if (!cidade || !linha || !dia) {
    if (resultado) resultado.innerHTML = '<div class="p-3 text-danger">Por favor, selecione a linha e o dia.</div>';
    return;
  }

  if (resultado) resultado.innerHTML = '<div class="p-3">Carregando horários...</div>';

  const url = `https://cartaometrocard.com.br/wp-json/metrocard/horarios/${linha}?dia=${encodeURIComponent(dia)}`;

  fetch(url)
    .then(res => res.json())
    .then(dadosAPI => {
      if (dadosAPI.saidas) {
        dadosAPI.saidas.forEach(saida => {
          saida.local = saida.local.replace(/ *- */g, ' → (sentido) → ');
          saida.local = saida.local.replace(/\//g, ' → (sentido) → ');
        });
      }

      const dadosFormatados = {
        linha: linha,
        dia: dia,
        saidas: dadosAPI.saidas || []
      };

      montarResultado(dadosFormatados);
    })
    .catch(err => {
      if (resultado) resultado.innerHTML = '<div class="p-3 text-danger">Erro ao carregar dados. Verifique sua conexão.</div>';
      console.error(err);
    });
}

function montarResultado(dados) {
  if (!resultado) return;
  resultado.innerHTML = '';

  const titulo = document.createElement('h2');
  titulo.textContent = `Linha: ${dados.linha} - Dia: ${dados.dia}`;
  resultado.appendChild(titulo);

  if (dados.saidas.length === 0) {
      resultado.innerHTML += '<div class="p-3">Nenhum horário encontrado para esta seleção.</div>';
      return;
  }

  dados.saidas.forEach(saida => {
    const saidaDiv = document.createElement('div');
    saidaDiv.classList.add('saida-container');
    saidaDiv.textContent = `Saída: ${saida.local}`;
    resultado.appendChild(saidaDiv);

    const horariosDiv = document.createElement('div');
    horariosDiv.classList.add('horarios-container');

    saida.horarios.forEach(horario => {
      const span = document.createElement('span');
      span.classList.add('horario-btn');
      span.textContent = horario;
      horariosDiv.appendChild(span);
    });

    resultado.appendChild(horariosDiv);
  });
}
