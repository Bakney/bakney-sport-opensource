"use strict";
// Cache Name
const CACHE_NAME = "static-cache-v1";

// Cache Files
const FILES_TO_CACHE = [
  "/offline.html",
  "/global.css?v=000990000",
  "/static/assets/css/style.bundle.css?v=000990000",
  "/static/assets/js/scripts.bundle.min.js?v=000990000",
];
// install
self.addEventListener("install", (evt) => {
  console.info("[ServiceWorker] Install");
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.info("[ServiceWorker] Pre-caching offline page");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});
// Active PWA Cache and clear out anything older
self.addEventListener("activate", (evt) => {
  console.info("[ServiceWorker] Activate");
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.info("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});
// listen for fetch events in page navigation and return anything that has been cached
self.addEventListener("fetch", (evt) => {
  console.info("[ServiceWorker] Fetch", evt.request.url);
  // when not a navigation event return
  if (evt.request.mode !== "navigate") {
    return;
  }
  evt.respondWith(
    fetch(evt.request).catch(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match("offline.html");
      });
    })
  );
});