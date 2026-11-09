console.log("UPDATED VERSION 3 - NUMBER PAD");

const ranges = [
  [13, 19],
  [21, 29],
  [31, 39],
  [41, 49],
  [51, 59],
  [61, 69],
  [71, 79],
  [81, 89],
  [91, 99],
];

const rangesDiv = document.getElementById("ranges");

ranges.forEach((r, i) => {
  const label = document.createElement("label");

  label.innerHTML = `
    <input type="checkbox" class="range" ${i < 3 ? "checked" : ""}>
    ${r[0]}-${r[1]}
  `;

  rangesDiv.appendChild(label);
});

let a, b;
let total = 0;
let correct = 0;
let streak = 0;
let totalTime = 0;
let startTime = 0;
let wrongQueue = [];
let feedbackTimer = null;
let active = false;
let waiting = false;

const answer = document.getElementById("answer");
const feedback = document.getElementById("feedback");

// Division Facts Display

const divisionFacts = document.createElement("div");
divisionFacts.id = "divisionFacts";
divisionFacts.innerHTML = "";

document.getElementById("feedback").insertAdjacentElement(
  "afterend",
  divisionFacts
);

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSelectedRanges() {
  const selected = [];

  document.querySelectorAll(".range").forEach((c, i) => {
    if (c.checked) selected.push(ranges[i]);
  });

  return selected;
}

function nextQuestion() {

  if (!active) return;

  waiting = false;

  if (wrongQueue.length > 0 && Math.random() < 0.3) {

    const q = wrongQueue.shift();
    a = q.a;
    b = q.b;

  } else {

    const selected = getSelectedRanges();

    if (selected.length === 0) {
      active = false;
      document.getElementById("question").textContent =
        "Select a range!";
      return;
    }

    const r = selected[rand(0, selected.length - 1)];

    let big = rand(r[0], r[1]);

    let min = Number(
      document.getElementById("minMultiplier").value
    );

    let max = Number(
      document.getElementById("maxMultiplier").value
    );

    if (!Number.isInteger(min) || !Number.isInteger(max) ||
        min < 1 || max < 1) {
      active = false;
      document.getElementById("question").textContent =
        "Invalid multiplier!";
      return;
    }

    if (min > max) {
      [min, max] = [max, min];
    }

    let small = rand(min, max);

    if (Math.random() < 0.5) {
      a = big;
      b = small;
    } else {
      a = small;
      b = big;
    }
  }

  document.getElementById("question").textContent =
    `${a} × ${b}`;

  answer.value = "";
  answer.focus();

  startTime = performance.now();
}

function updateStats() {

  const acc = total
    ? Math.round((correct / total) * 100)
    : 0;

  const avg = correct
    ? (totalTime / correct).toFixed(2)
    : "0.00";

  document.getElementById("accuracy").textContent =
    `Accuracy: ${acc}%`;

  document.getElementById("average").textContent =
    `Average: ${avg} s`;

  document.getElementById("streak").textContent =
    `Streak: ${streak}`;
}

function submitAnswer() {

  if (!active || waiting || !answer.value) return;

  const t = (performance.now() - startTime) / 1000;

  total++;

  const isCorrect = Number(answer.value) === a * b;

  if (isCorrect) {

    correct++;
    streak++;
    totalTime += t;

    const result = a * b;

    divisionFacts.innerHTML = `
      <div>${result} ÷ ${a} = ${b}</div>
      <div>${result} ÷ ${b} = ${a}</div>
    `;

    updateStats();
    nextQuestion();

  } else {

    streak = 0;
    wrongQueue.push({ a, b });

    feedback.textContent = `❌ Answer: ${a * b}`;
    feedback.style.color = "#ff5555";

    updateStats();

    waiting = true;

    feedbackTimer = setTimeout(() => {
      feedback.textContent = "";
      nextQuestion();
    }, 1000);
  }
}

// Start Training

document.getElementById("startBtn").onclick = () => {

  clearTimeout(feedbackTimer);

  total = 0;
  correct = 0;
  streak = 0;
  totalTime = 0;
  wrongQueue = [];

  active = true;
  waiting = false;

  feedback.textContent = "";

  updateStats();
  nextQuestion();
};

// Number Pad

document.querySelectorAll(".num-btn").forEach(button => {

  button.addEventListener("click", () => {

    const key = button.dataset.key;

    if (!active || waiting) return;

    if (key === "backspace") {
      answer.value = answer.value.slice(0, -1);
    }

    else if (key === "enter") {
      submitAnswer();
    }

    else {
      answer.value += key;
    }

    answer.focus();

  });

});

// Physical Keyboard

answer.addEventListener("keydown", e => {

  if (e.key === "Enter") {
    e.preventDefault();
    submitAnswer();
  }

});