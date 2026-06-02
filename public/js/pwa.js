'use strict'

/** Register the service worker once the page has fully loaded */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const hamburger = document.getElementById('hamburger-btn')
const sidebar = document.querySelector('.sidebar')
const overlay = document.getElementById('sidebar-overlay')

/**
 * Wire up the mobile hamburger menu: toggle the sidebar open/closed when the
 * button or the backdrop overlay is clicked, and close it when any sidebar
 * navigation link is tapped.
 */
if (hamburger && sidebar && overlay) {
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open')
    overlay.classList.toggle('visible')
  })

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open')
    overlay.classList.remove('visible')
  })

  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open')
      overlay.classList.remove('visible')
    })
  })
}
