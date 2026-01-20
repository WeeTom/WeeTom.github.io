(() => {
  const yearEl = document.getElementById("year");

  const swStateEl = document.getElementById("swState");
  const swDetailEl = document.getElementById("swDetail");
  const swDotEl = document.getElementById("swDot");
  const swScopeEl = document.getElementById("swScope");
  const cacheNamesEl = document.getElementById("cacheNames");
  const cacheListEl = document.getElementById("cacheList");
  const logEl = document.getElementById("log");

  const btnRegister = document.getElementById("registerBtn");
  const btnUnregister = document.getElementById("unregisterBtn");
  const btnClearCache = document.getElementById("clearCacheBtn");
  const btnCheckStatus = document.getElementById("checkStatusBtn");
  const btnListCache = document.getElementById("listCacheBtn");
  const btnFetchTest = document.getElementById("fetchTestBtn");

  const SUPPORT_SW = "serviceWorker" in navigator;
  const SUPPORT_CACHE = "caches" in window;

  function log(message) {
    const time = new Date().toLocaleTimeString();
    if (logEl) {
      logEl.textContent = `${time} ${message}\n${logEl.textContent}`;
    }
  }

  function setStatus(title, detail, active = false) {
    if (swStateEl) swStateEl.textContent = title;
    if (swDetailEl) swDetailEl.textContent = detail;
    if (swDotEl) {
      swDotEl.classList.toggle("status__dot--active", active);
    }
  }

  function refreshCaches() {
    if (!SUPPORT_CACHE) {
      if (cacheNamesEl) cacheNamesEl.textContent = "浏览器不支持 CacheStorage";
      if (cacheListEl) {
        cacheListEl.innerHTML = '<li class="muted">当前环境不支持 CacheStorage</li>';
      }
      return Promise.resolve();
    }

    return caches
      .keys()
      .then((keys) => {
        if (cacheNamesEl) cacheNamesEl.textContent = keys.join(", ") || "无";
        if (cacheListEl) {
          cacheListEl.innerHTML = "";
          if (!keys.length) {
            cacheListEl.innerHTML =
              '<li class="muted">当前没有缓存</li>';
            return;
          }
          keys.forEach((key) => {
            const item = document.createElement("li");
            item.textContent = key;
            cacheListEl.appendChild(item);
          });
        }
      })
      .catch((err) => {
        log(`读取缓存失败: ${err}`);
      });
  }

  function refreshStatus() {
    if (!SUPPORT_SW) {
      setStatus("不支持", "当前浏览器不支持 Service Worker");
      return;
    }

    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) {
          setStatus("未注册", "点击“注册/刷新 SW”以安装。");
          if (swScopeEl) swScopeEl.textContent = "--";
          return;
        }

        const worker = reg.active || reg.waiting || reg.installing;
        const state = worker?.state || "已注册";
        setStatus(
          reg.active ? "已激活" : "未激活",
          `线程状态：${state}`,
          Boolean(reg.active)
        );
        if (swScopeEl) swScopeEl.textContent = reg.scope;

        worker?.addEventListener("statechange", () => {
          setStatus(
            worker.state === "activated" ? "已激活" : "未激活",
            `线程状态：${worker.state}`,
            worker.state === "activated"
          );
          log(`Worker 状态变更: ${worker.state}`);
        });
      })
      .catch((err) => {
        setStatus("查询失败", String(err));
        log(`获取注册信息失败: ${err}`);
      });

    refreshCaches();
  }

  function registerServiceWorker() {
    if (!SUPPORT_SW) {
      log("当前浏览器不支持 Service Worker。");
      return;
    }

    const swUrl = new URL("sw.js", window.location.href);
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        log(`SW 注册成功，scope: ${reg.scope}`);
        reg.addEventListener("updatefound", () => {
          log("检测到新 worker，等待安装...");
        });
        refreshStatus();
      })
      .catch((err) => {
        log(`注册失败: ${err}`);
        setStatus("注册失败", String(err));
      });
  }

  function unregisterServiceWorker() {
    if (!SUPPORT_SW) return;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) {
          log("未找到已注册的 SW。");
          setStatus("未注册", "未找到注册记录。");
          return;
        }
        return reg.unregister().then((success) => {
          log(success ? "注销成功。" : "注销失败。");
          setStatus("未注册", "已请求注销。");
          refreshCaches();
        });
      })
      .catch((err) => {
        log(`注销失败: ${err}`);
      });
  }

  function clearCaches() {
    if (!SUPPORT_CACHE) {
      log("当前环境不支持 CacheStorage。");
      return;
    }

    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => {
        log("已清空所有缓存。");
        refreshCaches();
      })
      .catch((err) => log(`清理缓存失败: ${err}`));
  }

  function listCaches() {
    refreshCaches().then(() => log("已列出当前缓存键。"));
  }

  function testFetch() {
    const url = new URL("index.html", window.location.href);
    fetch(url.toString(), { cache: "no-store" })
      .then((res) => {
        log(`请求 ${res.url} 状态 ${res.status} (${res.type})`);
        return res.text();
      })
      .catch((err) => {
        log(`请求失败: ${err}`);
      });
  }

  function bindEvents() {
    btnRegister?.addEventListener("click", registerServiceWorker);
    btnUnregister?.addEventListener("click", unregisterServiceWorker);
    btnClearCache?.addEventListener("click", clearCaches);
    btnCheckStatus?.addEventListener("click", refreshStatus);
    btnListCache?.addEventListener("click", listCaches);
    btnFetchTest?.addEventListener("click", testFetch);

    if (SUPPORT_SW) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        log("controllerchange：控制权已切换，可能是新 SW 生效。");
        refreshStatus();
      });
    }
  }

  function init() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    bindEvents();
    refreshStatus();
    // 默认尝试注册一次，便于直接调试
    registerServiceWorker();
  }

  init();
})();
