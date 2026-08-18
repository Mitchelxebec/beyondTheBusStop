const CACHE_NAME = "btbs-shell-v1";

// Verified static frontend resources that exist in the project
const PRECACHE_RESOURCES = [
  "/",
  "/manifest.json",
  "/btbs.png",
  "/favicon.svg",
  "/icons.svg",
];

// 1. Install Event: Pre-cache verified app shell assets and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Pre-cache warning:", err);
        return self.skipWaiting();
      })
  );
});

// 2. Activate Event: Clean up outdated service worker caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("btbs-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Controlled caching strategy for frontend static resources only
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Ignore non-HTTP/HTTPS schemes (e.g., chrome-extension://)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // B. Non-GET requests (POST, PUT, PATCH, DELETE): Network-only
  if (request.method !== "GET") {
    return;
  }

  // C. API and Backend endpoints: STRICT Network-only
  // Never intercept, cache, or mock authentication, route queries, or dynamic endpoints
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("btbs-backend.onrender.com")
  ) {
    return;
  }

  // D. SPA Navigation requests (HTML document requests)
  // Network-first with offline fallback to cached React SPA shell ("/")
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  // E. Static Frontend Assets (/assets/*, images, fonts, icons, manifest)
  // Stale-While-Revalidate strategy for same-origin static files
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") ||
      PRECACHE_RESOURCES.includes(url.pathname) ||
      /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico|json)$/i.test(url.pathname));

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }
});
