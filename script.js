const ranges = [[13, 19], [21, 29], [31, 39], [41, 49], [51, 59], [61, 69], [71, 79], [81, 89], [91, 99]];
const rangesDiv = document.getElementById("ranges");
const rangeSummary = document.getElementById("rangeSummary");
const answer = document.getElementById("answer");
const factorAnswers = document.getElementById("factorAnswers");
const feedback = document.getElementById("feedback");
const question = document.getElementById("question");
const startBtn = document.getElementById("startBtn");
let mode = "multiply", active = false, waiting = false, a = 0, b = 0;
let factorValues = ["", ""], activeSlot = 0, reviewCurrent = null;
let total = 0, correct = 0, streak = 0, totalTime = 0, startTime = 0;
let wrongQueue = [], feedbackTimer;
let mistakeBank = JSON.parse(localStorage.getItem("microFactsMistakes") || "[]");
const reviewSummary = document.getElementById("reviewSummary");
function saveMistakes() {
  localStorage.setItem("microFactsMistakes", JSON.stringify(mistakeBank));
  reviewSummary.textContent = mistakeBank.length ? `มี ${mistakeBank.length} ข้อรอทบทวน` : "ยังไม่มีข้อที่พลาด · ลองฝึกคูณก่อน";
}
saveMistakes();

ranges.forEach(([low, high], i) => {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" class="range" ${i < 3 ? "checked" : ""}> ${low}-${high}`;
  rangesDiv.appendChild(label);
});

function updateRangeSummary() {
  const n = document.querySelectorAll(".range:checked").length;
  rangeSummary.textContent = n ? `เลือกแล้ว ${n} ชุด` : "เลือกอย่างน้อย 1 ชุด";
}
rangesDiv.addEventListener("change", updateRangeSummary);
updateRangeSummary();

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function setMode(next) {
  mode = next;
  active = false;
  document.querySelectorAll(".mode-card").forEach(card => card.classList.toggle("active", card.dataset.mode === mode));
  document.getElementById("multiplySettings").classList.toggle("hidden", mode !== "multiply");
  document.getElementById("advancedSettings").classList.toggle("hidden", mode !== "factors");
  factorAnswers.classList.toggle("hidden", mode !== "factors");
  answer.classList.toggle("hidden", mode === "factors");
  document.getElementById("numpad").classList.remove("hidden");
  document.querySelector(".answer-panel .keypad-hint").textContent = mode === "factors"
    ? "คลิกช่อง แล้วพิมพ์เลข · Tab สลับช่อง · Enter ส่งคำตอบ"
    : "แตะตัวเลข แล้วกด ↵ เพื่อส่งคำตอบ";
  question.innerHTML = '<span class="question-ready-en">Ready?</span><span class="question-ready-th">เริ่มฝึกเมื่อพร้อม</span>';
  feedback.textContent = "";
  startBtn.textContent = "เริ่มฝึก";
  updateStats();
}
document.querySelectorAll(".mode-card").forEach(card => card.addEventListener("click", () => setMode(card.dataset.mode)));

function setQuestion() {
  reviewCurrent = null;
  if (mode === "review") {
    if (!mistakeBank.length) { active = false; question.textContent = "ยังไม่มีข้อที่พลาดให้ทบทวน"; startBtn.textContent = "เริ่มฝึก"; return; }
    reviewCurrent = mistakeBank[rand(0, mistakeBank.length - 1)];
    a = reviewCurrent.a; b = reviewCurrent.b;
  }
  else if (wrongQueue.length && Math.random() < .3) ({ a, b } = wrongQueue.shift());
  else if (mode === "multiply") {
    const selected = [...document.querySelectorAll(".range")].flatMap((el, i) => el.checked ? [ranges[i]] : []);
    if (!selected.length) { active = false; question.textContent = "เลือกชุดเลขก่อนเริ่มฝึก"; return; }
    const [lo, hi] = selected[rand(0, selected.length - 1)];
    let min = Number(document.getElementById("minMultiplier").value), max = Number(document.getElementById("maxMultiplier").value);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < 1) { active = false; question.textContent = "เช็กช่วงตัวคูณอีกครั้ง"; return; }
    if (min > max) [min, max] = [max, min];
    a = rand(lo, hi); b = rand(min, max); if (Math.random() < .5) [a, b] = [b, a];
  } else if (mode === "factors") {
    const level = document.getElementById("challengeLevel").value;
    const lo = level === "easy" ? 2 : level === "medium" ? 4 : 10;
    const hi = level === "easy" ? 12 : level === "medium" ? 20 : 35;
    a = rand(lo, hi); b = rand(lo, hi);
  }
  if (mode === "factors") {
    question.textContent = `${a * b}`;
    factorValues = ["", ""]; activeSlot = 0; updateFactorSlots();
  } else {
    question.textContent = `${a} × ${b}`;
    answer.value = "";
  }
  startTime = performance.now();
}

function updateFactorSlots() {
  document.querySelectorAll(".factor-slot").forEach((slot, i) => {
    slot.textContent = factorValues[i] || "—";
    slot.classList.toggle("selected", i === activeSlot);
  });
}
document.querySelectorAll(".factor-slot").forEach(slot => slot.addEventListener("click", () => { activeSlot = Number(slot.dataset.slot); updateFactorSlots(); }));
document.addEventListener("keydown", event => {
  if (!active || waiting || mode !== "factors") return;
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    factorValues[activeSlot] += event.key;
    updateFactorSlots();
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    factorValues[activeSlot] = factorValues[activeSlot].slice(0, -1);
    updateFactorSlots();
  } else if (event.key === "Tab") {
    event.preventDefault();
    activeSlot = 1 - activeSlot;
    updateFactorSlots();
    document.querySelector(`.factor-slot[data-slot="${activeSlot}"]`).focus();
  } else if (event.key === "Enter") {
    event.preventDefault();
    submitAnswer();
  }
});

function updateStats() {
  document.getElementById("accuracy").textContent = `Accuracy: ${total ? Math.round(correct / total * 100) : 0}%`;
  document.getElementById("average").textContent = `Average: ${correct ? (totalTime / correct).toFixed(2) : "0.00"} s`;
  document.getElementById("streak").textContent = `Streak: ${streak}`;
}
function result(isCorrect, seconds, retry = { a, b }) {
  total++;
  if (isCorrect) { correct++; streak++; totalTime += seconds; feedback.textContent = "ถูกต้อง ✓"; feedback.style.color = "#62d69a"; }
  else {
    streak = 0; wrongQueue.push(retry);
    if (mode === "multiply") {
      const key = `${retry.a}x${retry.b}`;
      if (!mistakeBank.some(item => `${item.a}x${item.b}` === key)) mistakeBank.push(retry);
      saveMistakes();
    }
    feedback.textContent = `ลองอีกครั้ง · คำตอบ ${retry.a} × ${retry.b} = ${retry.a * retry.b}`; feedback.style.color = "#ff8585";
  }
  if (isCorrect && mode === "review" && reviewCurrent) {
    mistakeBank = mistakeBank.filter(item => !(item.a === reviewCurrent.a && item.b === reviewCurrent.b));
    saveMistakes();
  }
  updateStats(); waiting = true;
  feedbackTimer = setTimeout(() => { feedback.textContent = ""; waiting = false; if (active) setQuestion(); }, 850);
}
function submitAnswer() {
  if (!active || waiting) return;
  if (mode === "factors") {
    if (!factorValues.every(Boolean)) { feedback.textContent = "ใส่ตัวเลขให้ครบทั้งสองช่อง"; return; }
    const x = Number(factorValues[0]), y = Number(factorValues[1]);
    result(x * y === a * b, (performance.now() - startTime) / 1000, { a, b });
  } else if (answer.value) result(Number(answer.value) === a * b, (performance.now() - startTime) / 1000, { a, b });
}
startBtn.addEventListener("click", () => {
  clearTimeout(feedbackTimer); total = 0; correct = 0; streak = 0; totalTime = 0; wrongQueue = [];
  active = true; waiting = false; startBtn.textContent = "เริ่มใหม่"; feedback.textContent = ""; updateStats(); setQuestion();
});
document.querySelectorAll(".num-btn").forEach(button => button.addEventListener("click", () => {
  if (!active || waiting) return;
  const key = button.dataset.key;
  if (mode === "factors") {
    if (key === "enter") return submitAnswer();
    factorValues[activeSlot] = key === "backspace" ? factorValues[activeSlot].slice(0, -1) : factorValues[activeSlot] + key;
    updateFactorSlots();
  } else if (key === "enter") submitAnswer();
  else if (key === "backspace") answer.value = answer.value.slice(0, -1);
  else answer.value += key;
}));
answer.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submitAnswer(); } });

