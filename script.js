const game = document.querySelector(".game");
const items = ["🍎", "🍌", "🍇", "🍉", "🍎", "🍌", "🍇", "🍉"];
const score = document.querySelector(".score");
const bestTime = document.querySelector(".best");
const welcome = document.querySelector(".welcome");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");
const userName = document.querySelector("#input");
const even = document.querySelector(".event");
const sonner = document.querySelector(".sonner"); // контейнер для сообщений

let points = 0;
let secs = 0;
let interval;
let start = 0;
let elaps = 0;
let paused = true;

let firstCard = null;
let secondCard = null;
let lock = false;

// ======= API =======
async function saveScore(username, time) {
  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, time }),
    });
  } catch (err) {
    console.error("Error saving score:", err);
  }
}

async function loadLeaderboard() {
  try {
    const res = await fetch("/api/scores");
    const scores = await res.json();

    const list = document.getElementById("leaderboard");
    if (!list) return;
    list.innerHTML = "";

    scores.forEach((row, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${row.username} — ${row.time}s`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

async function checkUsername(name) {
  const res = await fetch("/api/scores");
  const scores = await res.json();
  return scores.some((row) => row.username === name);
}

// ======= Сообщения =======
function showMessage(text) {
  even.textContent = text;
  sonner.classList.add("active");
  setTimeout(() => sonner.classList.remove("active"), 3000);
}

// ======= Проверка имени =======
startBtn.addEventListener("click", async () => {
  const name = userName.value.trim();

  if (name === "") {
    showMessage("Please enter your name");
    return;
  }

  const exists = await checkUsername(name);
  if (exists) {
    showMessage("This username already exists");
    return;
  }

  welcome.style.display = "none";
});

// ======= Игровая логика =======
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateTime() {
  elaps = Date.now() - start;
  secs = Math.floor(elaps / 1000);
  score.textContent = `Timer: ${secs}`;
}

function resetPair() {
  [firstCard, secondCard] = [null, null];
  lock = false;
}

function handleCardClick(card) {
  if (paused) {
    paused = false;
    start = Date.now() - elaps;
    interval = setInterval(updateTime, 1000);
  }

  if (
    lock ||
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    return;
  }

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    lock = true;

    const firstSymbol = firstCard.querySelector(".card-back").textContent;
    const secondSymbol = secondCard.querySelector(".card-back").textContent;

    if (firstSymbol === secondSymbol) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");

      points++;
      if (points === items.length / 2) {
        clearInterval(interval);
        saveScore(userName.value.trim(), secs);
        loadLeaderboard();
      }
      resetPair();
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetPair();
      }, 1000);
    }
  }
}

function createCards() {
  shuffle(items).forEach((symbol) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.textContent = symbol;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener("click", () => handleCardClick(card));
    game.appendChild(card);
  });
}

restartBtn.addEventListener("click", () => {
  game.innerHTML = "";
  points = 0;
  paused = true;
  secs = 0;
  start = 0;
  elaps = 0;
  score.textContent = "Timer: 0";
  clearInterval(interval);
  interval = null;
  resetPair();
  createCards();
});

// ======= Инициализация =======
createCards();
loadLeaderboard();
