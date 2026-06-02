'use strict'

const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'

const userName = localStorage.getItem('name') || ''
document.getElementById('user-name').textContent = userName

const hour = new Date().getHours()
const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
document.getElementById('greeting').textContent = `${timeGreeting}, ${userName}!`

/** Clears auth state and redirects to the login page */
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('name')
  window.location.href = 'login.html'
})

const headers = { Authorization: `Bearer ${token}` }

/**
 * Converts a duration in minutes to a human-readable string.
 * Examples: 90 → "1h 30m", 45 → "45m".
 *
 * @param {number} mins - Duration in minutes.
 * @returns {string}
 */
const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/**
 * Fetches the per-course summary from the API and renders it in the
 * #course-summary list. Also updates the #course-count badge.
 *
 * @async
 * @returns {Promise<void>}
 */
const loadSummary = async () => {
  const res = await fetch('/api/sessions/summary', { headers })
  const data = await res.json()
  const list = document.getElementById('course-summary')

  if (!data.length) return

  list.innerHTML = data.map(d => `
    <li class="list-item">
      <strong>${d.courseName}</strong>
      <span class="time-value">${formatMinutes(d.totalMinutes)}</span>
    </li>
  `).join('')

  document.getElementById('course-count').textContent = data.length
}

/**
 * Fetches all sessions from the API, renders the 5 most recent ones in the
 * #recent-sessions list, and updates the #week-total badge with the sum of
 * minutes logged in the last 7 days.
 *
 * @async
 * @returns {Promise<void>}
 */
const loadRecentSessions = async () => {
  const res = await fetch('/api/sessions', { headers })
  const data = await res.json()
  const list = document.getElementById('recent-sessions')

  if (!data.length) {
    document.getElementById('week-total').textContent = '0m'
    return
  }

  const recent = data.slice(-5).reverse()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekTotal = data
    .filter(s => new Date(s.date) >= weekAgo)
    .reduce((sum, s) => sum + s.duration, 0)

  document.getElementById('week-total').textContent = formatMinutes(weekTotal)

  list.innerHTML = recent.map(s => `
    <li class="list-item">
      <div class="session-info">
        <strong>${s.courseId?.name || 'Unknown'}</strong>
        <span class="session-meta">${new Date(s.date).toLocaleDateString('sv-SE')} · ${formatMinutes(s.duration)}</span>
        ${s.comment ? `<span class="session-comment">${s.comment}</span>` : ''}
      </div>
    </li>
  `).join('')
}

loadSummary()
loadRecentSessions()
