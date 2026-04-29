'use strict'

const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'

document.getElementById('user-name').textContent = localStorage.getItem('name') || ''

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('name')
  window.location.href = 'login.html'
})

const headers = { Authorization: `Bearer ${token}` }

const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const loadSummary = async () => {
  const res = await fetch('/api/sessions/summary', { headers })
  const data = await res.json()
  const list = document.getElementById('course-summary')

  if (!data.length) return

  list.innerHTML = data.map(d => `
    <li class="list-item">
      <span>${d.courseName}</span>
      <span class="stat-value-sm">${formatMinutes(d.totalMinutes)}</span>
    </li>
  `).join('')

  document.getElementById('course-count').textContent = data.length
}

const loadRecentSessions = async () => {
  const res = await fetch('/api/sessions', { headers })
  const data = await res.json()
  const list = document.getElementById('recent-sessions')

  if (!data.length) return

  const recent = data.slice(-5).reverse()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekTotal = data
    .filter(s => new Date(s.date) >= weekAgo)
    .reduce((sum, s) => sum + s.duration, 0)

  document.getElementById('week-total').textContent = formatMinutes(weekTotal)

  list.innerHTML = recent.map(s => `
    <li class="list-item">
      <span>${s.courseId?.name || 'Unknown'}</span>
      <span>${new Date(s.date).toLocaleDateString()}</span>
      <span class="stat-value-sm">${formatMinutes(s.duration)}</span>
    </li>
  `).join('')
}

loadSummary()
loadRecentSessions()
