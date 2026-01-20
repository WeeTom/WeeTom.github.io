const CACHE_NAME = "weetom-static-v1";
const BASE_URL = new URL("./", self.location);
const ASSETS = ["", "index.html", "styles.css", "main.js"].map((path) => {
  return new URL(path, BASE_URL).toString();
});
const INDEX_URL = new URL("index.html", BASE_URL).toString();

// 安装阶段：预缓存核心静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活阶段：清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 运行时请求：缓存优先，网络兜底。导航请求兜底返回首页。
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // 仅缓存可重复使用的 200 响应
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(INDEX_URL);
          }
          return caches.match(event.request);
        });
    })
  );
});
