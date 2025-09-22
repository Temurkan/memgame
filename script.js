const game = document.querySelector(".game");
const items = ["🍎", "🍌", "🍇", "🍉", "🍎", "🍌", "🍇", "🍉"];
const score = document.querySelector(".score");
const bestTime = document.querySelector(".best");
const welcome = document.querySelector(".welcome");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");
const userName = document.querySelector("#input");
const even = document.querySelector(".event");
const sonner = document.querySelector(".sonner");

let points = 0,
  secs = 0,
  interval,
  start = 0,
  elaps = 0,
  paused = true;
let firstCard = null,
  secondCard = null,
  lock = false;

// ===== API =====
async function saveScore(username, time) {
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, time }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error saving score:", err);
  }
}

async function loadPlayerBestTime(username) {
  try {
    const res = await fetch("/api/scores");
    const scores = await res.json();
    const player = scores.find((r) => r.username === username);
    bestTime.textContent = player
      ? `Best time: ${player.time}s`
      : "Best time: 0s";
  } catch (err) {
    console.error("Error loading player best time:", err);
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

// ===== Messages =====
function showMessage(text) {
  even.textContent = text;
  sonner.classList.add("active");
  setTimeout(() => sonner.classList.remove("active"), 3000);
}

// ===== Start Game =====
startBtn.addEventListener("click", async () => {
  const inputName = userName.value.trim();
  const storedName = localStorage.getItem("playerName");

  if (!storedName && inputName === "") {
    showMessage("Please enter your name");
    return;
  }

  // Если есть локальное имя и ввели другое — запрещаем
  if (storedName && inputName && inputName !== storedName) {
    showMessage(`This game is for ${storedName}. You cannot use another name.`);
    return;
  }

  const currentName = storedName || inputName;
  localStorage.setItem("playerName", currentName);

  welcome.style.display = "none";

  await loadPlayerBestTime(currentName);
  await loadLeaderboard();
});

// ===== Game Logic =====
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

async function handleCardClick(card) {
  if (paused) {
    paused = false;
    start = Date.now() - elaps;
    interval = setInterval(updateTime, 1000);
  }
  if (
    lock ||
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  )
    return;

  card.classList.add("flipped");

  if (!firstCard) firstCard = card;
  else {
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
        const playerName = localStorage.getItem("playerName");
        await saveScore(playerName, secs);
        await loadPlayerBestTime(playerName);
        await loadLeaderboard();
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

// ===== Cards =====
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

// ===== Restart =====
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

// ===== Init =====
window.addEventListener("DOMContentLoaded", async () => {
  const storedName = localStorage.getItem("playerName");
  if (storedName) {
    userName.value = storedName;
    welcome.style.display = "none";
    await loadPlayerBestTime(storedName);
    await loadLeaderboard();
  }
  createCards();
});
