const CACHE_NAME = "pelis-cache-v4";

const ASSETS = [
  "./",
  "index.html",
  "add.html",
  "catalog.html",
  "edit.html",
  "movie.html",
  "tema.js",
  "manifest.json",
  "css/index.css",
  "css/add.css",
  "css/catalog.css",
  "css/edit.css",
  "css/movie.css",
  "css/tema.css",
  "js/index.js",
  "js/add.js",
  "js/catalog.js",
  "js/edit.js",
  "js/movie.js",
  "js/tema.js",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/default.jpg",
  "login.html",
  "js/login.js",
  "js/auth-state.js",
  "css/login.css"
];

// INSTALACIÓN
self.addEventListener("install", event => {
   self.skipWaiting(); // ← ACTIVA EL SW NUEVO AL INSTANTE
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  self.clients.claim(); // ← EL SW NUEVO TOMA CONTROL SIN ESPERAR
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// FETCH único con fallback
self.addEventListener("fetch", event => {
  const req = event.request;

  // No cachear Firestore
  if (req.url.includes("firestore.googleapis.com")) return;
  // No cachear login.html
  if (req.url.includes("login.html")) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      return (
        cached ||
        fetch(req).catch(() => {
          // Fallback solo para imágenes
          if (req.destination === "image") {
            return caches.match("/img/default.jpg");
          }
        })
      );
    })
  );
});
