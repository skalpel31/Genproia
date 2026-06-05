// Genproia Service Worker — PWA
const CACHE_NAME = 'genproia-v1';
const ASSETS = [
  '/index.html',
  '/genproia-dashboard.html',
  '/genproia-moteur-ia.html',
  '/manifest.json',
];

// Installation — mise en cache des assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation — supprime les vieux caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network first, fallback to cache
self.addEventListener('fetch', (e) => {
  // Skip cross-origin requests (API, fonts)
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache la réponse fraîche
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // Offline → fallback cache
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Page offline par défaut
          return new Response(`
            <!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <title>Genproia — Hors ligne</title>
            <style>
              body{background:#05030f;color:#f0ecff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}
              h1{font-size:1.5rem;margin-bottom:8px}p{color:#7a6fa0;font-size:0.9rem}
              .logo{font-size:2rem;font-weight:800;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px}
            </style>
            </head>
            <body>
              <div>
                <div class="logo">Genproia</div>
                <h1>Tu es hors ligne 📡</h1>
                <p>Vérifie ta connexion internet pour continuer à générer ton business.</p>
              </div>
            </body>
            </html>
          `, { headers: { 'Content-Type': 'text/html' } });
        });
      })
  );
});
