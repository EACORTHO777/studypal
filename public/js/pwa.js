'use strict'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const hamburger = document.getElementById('hamburger-btn')
const sidebar = document.querySelector('.sidebar')
const overlay = document.getElementById('sidebar-overlay')

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
