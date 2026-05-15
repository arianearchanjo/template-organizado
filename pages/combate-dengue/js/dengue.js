/**
 * dengue.js — Prefeitura de Campina Grande do Sul
 * Lógica do Quiz e Banner Responsivo integrada ao layout e-SIC.
 */

(function () {
  'use strict';

  // 1. BANNER RESPONSIVO
  function ajustarBanner() {
    const img = document.getElementById("banner-img");
    if (!img) return;

    // URL da imagem original fornecida pelo usuário
    const bannerUrl = "https://www.campinagrandedosul.pr.gov.br/Downloads/Imagens/2019/1/yd15kgr04m0.png";
    img.src = bannerUrl;
  }

  // 2. QUIZ INTERATIVO
  const questions = [
    {
      questionText: 'Qual é o nome do mosquito transmissor da dengue?',
      answerOptions: [
        { answerText: 'Anopheles', isCorrect: false },
        { answerText: 'Aedes aegypti', isCorrect: true },
        { answerText: 'Culex', isCorrect: false },
        { answerText: 'Aedes albopictus', isCorrect: false },
      ],
      explanation: 'O Aedes aegypti é o principal vetor da dengue no Brasil.'
    },
    {
      questionText: 'Quantos sorotipos do vírus da dengue são conhecidos?',
      answerOptions: [
        { answerText: '2', isCorrect: false },
        { answerText: '3', isCorrect: false },
        { answerText: '4', isCorrect: true },
        { answerText: '5', isCorrect: false },
      ],
      explanation: 'Existem quatro sorotipos conhecidos: DENV-1, DENV-2, DENV-3 e DENV-4.'
    },
    {
      questionText: 'Qual das opções abaixo NÃO é uma forma eficaz de prevenir a dengue?',
      answerOptions: [
        { answerText: 'Usar telas em janelas', isCorrect: false },
        { answerText: 'Eliminar água parada', isCorrect: false },
        { answerText: 'Borralho de café nos reservatórios', isCorrect: true },
        { answerText: 'Tampas em caixas d\'água', isCorrect: false },
      ],
      explanation: 'O borralho de café não possui comprovação científica de eficácia contra o mosquito da dengue.'
    },
    {
      questionText: 'Qual destes NÃO é um sintoma típico da dengue?',
      answerOptions: [
        { answerText: 'Febre alta', isCorrect: false },
        { answerText: 'Dor atrás dos olhos', isCorrect: false },
        { answerText: 'Manchas avermelhadas na pele', isCorrect: false },
        { answerText: 'Coriza e espirros frequentes', isCorrect: true },
      ],
      explanation: 'Coriza e espirros são mais típicos de resfriados e gripes, não da dengue.'
    },
    {
      questionText: 'Em qual período do ano há maior risco de epidemias de dengue no Brasil?',
      answerOptions: [
        { answerText: 'De outubro a maio', isCorrect: true },
        { answerText: 'De janeiro a março apenas', isCorrect: false },
        { answerText: 'Durante todo o ano igualmente', isCorrect: false },
        { answerText: 'De junho a setembro', isCorrect: false },
      ],
      explanation: 'A dengue possui padrão sazonal, com maior risco entre outubro de um ano a maio do ano seguinte.'
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  let answered = false;

  const el = {
    questionText: document.getElementById('question-text'),
    answerButtons: document.getElementById('answer-buttons'),
    nextButton: document.getElementById('next-button'),
    questionNumber: document.getElementById('question-number'),
    currentScore: document.getElementById('current-score'),
    progressBar: document.getElementById('progress-bar'),
    explanation: document.getElementById('explanation'),
    explanationText: document.getElementById('explanation-text'),
    questionContainer: document.getElementById('question-container'),
    scoreContainer: document.getElementById('score-container'),
    finalScore: document.getElementById('final-score'),
    scoreMessage: document.getElementById('score-message'),
    scoreIcon: document.getElementById('score-icon'),
    restartBtn: document.getElementById('restart-button')
  };

  function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    if (el.questionContainer) el.questionContainer.style.display = 'block';
    if (el.scoreContainer) el.scoreContainer.style.display = 'none';
    if (el.nextButton) el.nextButton.style.display = 'none';
    if (el.explanation) el.explanation.style.display = 'none';
    if (el.currentScore) el.currentScore.textContent = `Pontuação: ${score}`;
    loadQuestion();
  }

  function loadQuestion() {
    if (!el.answerButtons) return;
    answered = false;
    el.nextButton.style.display = 'none';
    el.explanation.style.display = 'none';
    el.answerButtons.innerHTML = '';
    
    if (el.questionNumber) el.questionNumber.textContent = `Questão ${currentQuestion + 1} de ${questions.length}`;
    if (el.progressBar) el.progressBar.style.width = `${(currentQuestion / questions.length) * 100}%`;

    const q = questions[currentQuestion];
    if (el.questionText) el.questionText.textContent = q.questionText;

    q.answerOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      // Usando classes padrão do template/bootstrap para manter o design "lindo" do e-SIC
      btn.classList.add('btn', 'btn-outline-primary', 'w-100', 'text-left', 'p-3', 'border', 'mb-2', 'bg-white');
      
      const letter = String.fromCharCode(65 + idx);
      btn.innerHTML = `<strong>${letter})</strong> <span class="ml-2">${opt.answerText}</span>`;
      
      btn.onclick = () => selectAnswer(opt.isCorrect, btn, idx);
      el.answerButtons.appendChild(btn);
    });
  }

  function selectAnswer(isCorrect, btn, selectedIdx) {
    if (answered) return;
    answered = true;

    const allBtns = el.answerButtons.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('btn-success', 'text-white');
      score++;
      if (el.currentScore) el.currentScore.textContent = `Pontuação: ${score}`;
    } else {
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('btn-danger', 'text-white');
      
      // Destaca a correta para o usuário aprender
      questions[currentQuestion].answerOptions.forEach((opt, i) => {
        if (opt.isCorrect) {
          allBtns[i].classList.remove('btn-outline-primary');
          allBtns[i].classList.add('btn-success', 'text-white');
        }
      });
    }

    if (el.explanationText) el.explanationText.textContent = questions[currentQuestion].explanation;
    if (el.explanation) el.explanation.style.display = 'flex';
    
    if (el.nextButton) {
        el.nextButton.style.display = 'inline-block';
        if (currentQuestion === questions.length - 1) {
          el.nextButton.innerHTML = 'Ver Resultado <i class="fas fa-arrow-right ml-2"></i>';
        } else {
          el.nextButton.innerHTML = 'Próxima <i class="fas fa-arrow-right ml-1"></i>';
        }
    }
  }

  function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    if (el.questionContainer) el.questionContainer.style.display = 'none';
    if (el.scoreContainer) el.scoreContainer.style.display = 'block';
    if (el.finalScore) el.finalScore.innerHTML = `<i class="fas fa-check-circle text-success mr-2"></i> Você acertou ${score} de ${questions.length} questões!`;

    if (el.scoreMessage) {
        if (score === questions.length) {
          el.scoreMessage.innerHTML = '<div class="alert alert-success">Parabéns! Você é um especialista em prevenção da dengue!</div>';
        } else if (score >= questions.length / 2) {
          el.scoreMessage.innerHTML = '<div class="alert alert-info">Bom trabalho! Você conhece bem sobre a dengue, mas ainda pode aprender mais!</div>';
        } else {
          el.scoreMessage.innerHTML = '<div class="alert alert-warning">Continue estudando sobre a dengue para se proteger melhor!</div>';
        }
    }
  }

  // 3. NAVEGAÇÃO POR ABAS
  function initTabs() {
    const btns = document.querySelectorAll('.dg-tab-btn');
    const paineis = document.querySelectorAll('.dg-tab-painel');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('aria-controls');
        
        // Remove ativo de todos
        btns.forEach(b => b.classList.remove('ativo'));
        paineis.forEach(p => p.classList.remove('ativo'));
        
        // Adiciona no clicado
        btn.classList.add('ativo');
        const target = document.getElementById(targetId);
        if (target) target.classList.add('ativo');
      });
    });
  }

  // INICIALIZAÇÃO
  document.addEventListener('DOMContentLoaded', () => {
    ajustarBanner();
    initTabs();
    
    if (el.questionText) {
      if (el.nextButton) el.nextButton.addEventListener('click', nextQuestion);
      if (el.restartBtn) el.restartBtn.addEventListener('click', startQuiz);
      startQuiz();
    }
  });

})();
