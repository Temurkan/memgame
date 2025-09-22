const game = document.querySelector(".game");
const items = ["🍎", "🍌", "🍇", "🍉", "🍎", "🍌", "🍇", "🍉"];
const score = document.querySelector(".score");
const bestTime = document.querySelector(".best");
const welcome = document.querySelector(".welcome");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");
const userName = document.querySelector("#input");
const even = document.querySelector(".event");

// Загружаем рекорд
let record = localStorage.getItem("record");
record = record ? Number(record) : null;

bestTime.textContent = "Best time: " + (record !== null ? record : "0");

startBtn.addEventListener("click", () => {
  let t = JSON.parse(localStorage.getItem("userobj"));

  if (userName.value.trim() === "") {
    sonner.classList.add("active");
    even.innerHTML = "Please enter your name";
    function greet() {
      sonner.classList.remove("active");
    }

    setTimeout(greet, 4000);
  } else if (t.user === userName.value.trim()) {
    even.innerHTML = "This username has taken";
    sonner.classList.add("active");
    function greet() {
      sonner.classList.remove("active");
    }

    setTimeout(greet, 4000);
  } else {
    welcome.style.display = "none";
  }
});

let points = 0;
let secs = 0;
let interval;
let start = 0;
let elaps = 0;
let paused = true;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let firstCard = null;
let secondCard = null;
let lock = false;

function updateTime() {
  elaps = Date.now() - start;
  secs = Math.floor((elaps / 1000) % 60);
  score.innerHTML = `Timer: ${secs}`;
}

function createCards() {
  shuffle(items).forEach((symbol) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");
    front.textContent = "";

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.textContent = symbol;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener("click", () => {
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

      if (!firstCard) {
        firstCard = card;
      } else {
        secondCard = card;
        lock = true;

        const firstSymbol = firstCard.querySelector(".card-back").textContent;
        const secondSymbol = secondCard.querySelector(".card-back").textContent;

        const userObj = {
          user: userName.value,
          time: secs,
        };

        if (firstSymbol === secondSymbol) {
          firstCard.classList.add("matched");
          secondCard.classList.add("matched");

          points++;
          if (points === 4) {
            clearInterval(interval);

            // Обновляем рекорд
            if (record === null || secs < record) {
              record = secs;
              localStorage.setItem("record", record);
              localStorage.setItem("userobj", JSON.stringify(userObj));
              bestTime.textContent = "Best time: " + record;
            }
          }

          reset();
        } else {
          setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            reset();
          }, 1000);
        }
      }
    });

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
  score.innerHTML = `Timer: ${secs}`;
  clearInterval(interval);
  interval = null;
  firstCard = null;
  secondCard = null;
  lock = false;
  createCards();
});

createCards();

function reset() {
  [firstCard, secondCard] = [null, null];
  lock = false;
}
