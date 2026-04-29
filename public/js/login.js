'use strict'

const form = document.getElementById('login-form')
const errorMsg = document.getElementById('error-msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorMsg.textContent = ''

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    errorMsg.textContent = data.message || 'Something went wrong'
    return
  }

  localStorage.setItem('token', data.token)
  localStorage.setItem('name', data.name)
  window.location.href = 'dashboard.html'
})
