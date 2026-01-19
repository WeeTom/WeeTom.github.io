(() => {
  const STORAGE_KEY = "weesom.themeMode";
  const themeModeEl = document.getElementById("themeMode");
  const yearEl = document.getElementById("year");
  const resourceListEl = document.getElementById("resourceList");

  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");

  function setHtmlTheme(mode) {
    const root = document.documentElement;
    if (mode === "light" || mode === "dark") {
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function loadMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "auto") return saved;
    return "auto";
  }

  function saveMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function applyMode(mode) {
    setHtmlTheme(mode);
    if (themeModeEl) themeModeEl.value = mode;
  }

  function init() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const mode = loadMode();
    applyMode(mode);

    themeModeEl?.addEventListener("change", () => {
      const next = themeModeEl.value;
      if (next !== "auto" && next !== "light" && next !== "dark") return;
      saveMode(next);
      applyMode(next);
    });

    // 当处于“自动”模式时，系统主题变化无需 JS 介入（CSS @media 会自动响应）
    // 这里监听只是为了在未来若需要展示“当前系统主题”提示时更容易扩展。
    const onSystemThemeChange = () => {
      if (loadMode() === "auto") applyMode("auto");
    };

    // 新标准
    mq?.addEventListener?.("change", onSystemThemeChange);
    // Safari 旧版本
    mq?.addListener?.(onSystemThemeChange);

    renderResourceOrigins();
  }

  function renderResourceOrigins() {
    if (!resourceListEl) return;
    const nodes = Array.from(
      document.querySelectorAll(
        'link[href],script[src],img[src],source[src],video[src],audio[src],track[src],iframe[src]'
      )
    );

    const items = [];
    const seen = new Set();

    nodes.forEach((el) => {
      const attr = el.hasAttribute("src") ? "src" : "href";
      const raw = el.getAttribute(attr);
      if (!raw) return;

      const tag = el.tagName.toLowerCase();
      const key = `${tag}|${raw}`;
      if (seen.has(key)) return;
      seen.add(key);

      let resolved = raw;
      try {
        resolved = new URL(raw, window.location.href).href;
      } catch {
        /* ignore */
      }

      const li = document.createElement("li");
      li.textContent = `${tag} → ${resolved}`;
      items.push(li);
    });

    resourceListEl.replaceChildren(...items);
  }

  init();
})();


