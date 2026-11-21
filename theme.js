(() => {
  const key = "microFactsTheme";
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll(".theme-toggle")];

  function apply(theme) {
    root.dataset.theme = theme;
    const toLight = theme !== "light";
    buttons.forEach(button => {
      button.textContent = toLight ? "☀️" : "🌙";
      button.title = toLight ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด";
      button.setAttribute("aria-label", button.title);
    });
  }

  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem(key) || "dark"; } catch (_) {}
  apply(savedTheme === "light" ? "light" : "dark");
  buttons.forEach(button => button.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    try { localStorage.setItem(key, next); } catch (_) {}
  }));
})();
