/// <reference lib="webworker" />
'use strict'

const CACHE_NAME = 'studypal-v4'

/** Static assets to pre-cache during service worker installation */
const STATIC_ASSETS = [
  '/login.html',
  '/register.html',
  '/dashboard.html',
  '/courses.html',
  '/sessions.html',
  '/css/style.css',
  '/js/dashboard.js',
  '/js/courses.js',
  '/js/sessions.js',
  '/logo.png',
  '/manifest.json'
]

/**
 * Installs the service worker by pre-caching all static assets.
 * Calls skipWaiting() so the new worker activates immediately.
 *
 * @param {ExtendableEvent} event
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

/**
 * Activates the service worker and removes any outdated caches from previous
 * versions, then claims all open clients immediately.
 *
 * @param {ExtendableEvent} event
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

/**
 * Intercepts fetch requests. API calls are always passed through to the network.
 * All other requests are served from the cache when available, falling back to
 * the network.
 *
 * @param {FetchEvent} event
 */
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
