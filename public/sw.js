'use strict'

const CACHE_NAME = 'studypal-v3'
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
