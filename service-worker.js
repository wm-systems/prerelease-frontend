// A minimal Service Worker to enable PWA install
self.addEventListener('install', event => {
  // Activate worker immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  // Take control of uncontrolled clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Default: always go to network
  event.respondWith(fetch(event.request));
});
