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
  if (wrongQueue.length > 0 && Math.random() < 0.3) {
    const q = wrongQueue.shift();
    a = q.a;
    b = q.b;
  } else {
    const selected = getSelectedRanges();
    const r = selected[rand(0, selected.length - 1)];

    a = rand(r[0], r[1]);
    b = rand(
      Number(document.getElementById("minMultiplier").value),
      Number(document.getElementById("maxMultiplier").value)
    );
  }

  document.getElementById("question").textContent = `${a} × ${b}`;

  const ans = document.getElementById("answer");
  ans.value = "";
  ans.focus();

  startTime = performance.now();
}

function updateStats(lastTime = 0) {
  const acc = total ? Math.round((correct / total) * 100) : 0;
  const avg = correct ? (totalTime / correct).toFixed(2) : "0.00";

  document.getElementById("accuracy").textContent =
    `Accuracy: ${acc}%`;

  document.getElementById("average").textContent =
    `Average: ${avg} s`;

  document.getElementById("streak").textContent =
    `Streak: ${streak}`;
}

document.getElementById("startBtn").onclick = () => {
  total = 0;
  correct = 0;
  streak = 0;
  totalTime = 0;
  wrongQueue = [];

  nextQuestion();
  updateStats();
};

document.getElementById("answer").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const t = (performance.now() - startTime) / 1000;

  total++;

  if (Number(e.target.value) === a * b) {
    correct++;
    streak++;
    totalTime += t;
  } else {
    streak = 0;
    wrongQueue.push({ a, b });
    alert(`❌ คำตอบคือ ${a * b}`);
  }

  updateStats(t);
  nextQuestion();
});