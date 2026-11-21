(() => {
  const key = "microFactsTheme";
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll(".theme-toggle")];

  function apply(theme) {
    root.dataset.theme = theme;
    const toLight = theme !== "light";
    buttons.forEach(button => {
      button.innerHTML = toLight
        ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
        : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.8 8.8 0 1 0 12 12z"/></svg>';
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
