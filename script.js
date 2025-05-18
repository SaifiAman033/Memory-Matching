const themes = {
  fruits: ['🍎', '🍌', '🍇', '🍓', '🍍', '🍉', '🥝', '🍒'],
  animals: ['🐶', '🐱', '🦊', '🐸', '🐵', '🐯', '🐷', '🐰'],
  faces: ['😀', '😂', '😎', '😍', '😭', '😡', '😱', '🤔']
};

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timer = 0;
let timerInterval;
let score = 0;
let level = 1;
let cardsPerLevel = 8;

const board = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart');
const modal = document.getElementById('winModal');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const themeSelect = document.getElementById('theme-select');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const levelUpModal = document.getElementById('levelUpModal');
const nextLevelSpan = document.getElementById('nextLevel');

const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const mismatchSound = document.getElementById('mismatchSound');
const gameOverSound = document.getElementById('gameOverSound');
const winSound = document.getElementById('winSound');

restartButton.addEventListener('click', restartGame);
themeSelect.addEventListener('change', restartGame);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function createBoard(theme) {
  board.innerHTML = '';
  const symbols = themes[theme];
  let pairs = Math.min(cardsPerLevel, symbols.length);
  let selectedSymbols = shuffle([...symbols]).slice(0, pairs);
  cards = [...selectedSymbols, ...selectedSymbols];
  shuffle(cards);
  cards.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="card-inner">
        <div class="front">${symbol}</div>
        <div class="back">❓</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card, symbol));
    board.appendChild(card);
  });
  board.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(cards.length))}, 100px)`;
}

function flipCard(card, symbol) {
  if (lockBoard || card.classList.contains('flip') || card.classList.contains('matched')) return;
  card.classList.add('flip');
  playSound(flipSound);
  if (!firstCard) {
    firstCard = { card, symbol };
    return;
  }
  secondCard = { card, symbol };
  moves++;
  movesDisplay.textContent = moves;
  if (firstCard.symbol === secondCard.symbol) {
    playSound(matchSound);
    firstCard.card.classList.add('matched');
    secondCard.card.classList.add('matched');
    matchedPairs++;
    updateScore(10 + Math.max(0, 5 - moves));
    firstCard = null;
    secondCard = null;
    if (matchedPairs === cards.length / 2) {
      clearInterval(timerInterval);
      playSound(winSound);
      showConfetti();
      setTimeout(() => {
        levelUp();
      }, 700);
    }
  } else {
    lockBoard = true;
    playSound(mismatchSound);
    setTimeout(() => {
      firstCard.card.classList.remove('flip');
      secondCard.card.classList.remove('flip');
      firstCard = null;
      secondCard = null;
      lockBoard = false;
    }, 800);
  }
}

function updateScore(points) {
  score += points;
  scoreDisplay.textContent = score;
}

function startTimer() {
  timer = 0;
  timerDisplay.textContent = timer;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
    if (timer > 120) {
      clearInterval(timerInterval);
      playSound(gameOverSound);
      alert('Time up! Try again.');
      restartGame();
    }
  }, 1000);
}

function restartGame() {
  modal.style.display = 'none';
  levelUpModal.style.display = 'none';
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  movesDisplay.textContent = moves;
  score = 0;
  level = 1;
  cardsPerLevel = 8;
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  const selectedTheme = themeSelect.value;
  createBoard(selectedTheme);
  startTimer();
}

function levelUp() {
  level++;
  levelDisplay.textContent = level;
  cardsPerLevel = Math.min(cardsPerLevel + 2, 12);
  nextLevelSpan.textContent = level;
  levelUpModal.style.display = 'flex';
}

function nextLevel() {
  levelUpModal.style.display = 'none';
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  movesDisplay.textContent = moves;
  const selectedTheme = themeSelect.value;
  createBoard(selectedTheme);
  startTimer();
}

function showConfetti() {
  const confettiColors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800', '#795548'];
  const confettiContainer = document.getElementById('confetti');
  confettiContainer.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-40px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.animationDelay = (Math.random() * 0.7) + 's';
    confettiContainer.appendChild(confetti);
  }
  setTimeout(() => { confettiContainer.innerHTML = ''; }, 3000);
}

restartGame();
