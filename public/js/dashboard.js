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
 * Escapes text for safe insertion into an HTML template string.
 *
 * @param {string} text - Untrusted text, such as a course name or comment.
 * @returns {string}
 */
const escapeHtml = (text) => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

/**
 * Formats a Date as a local YYYY-MM-DD key. Sessions are stored at midnight
 * UTC of the day the user picked, so their ISO date prefix uses the same format.
 *
 * @param {Date} date - The date to format.
 * @returns {string}
 */
const toDayKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-')

/**
 * Fetches the per-course summary from the API and renders it in the
 * #course-summary list as horizontal bars, longest first. Also updates the
 * #course-count badge.
 *
 * @async
 * @returns {Promise<void>}
 */
const loadSummary = async () => {
  const res = await fetch('/api/sessions/summary', { headers })
  const data = await res.json()
  const list = document.getElementById('course-summary')

  if (!data.length) return

  const sorted = [...data].sort((a, b) => b.totalMinutes - a.totalMinutes)
  const max = sorted[0].totalMinutes
  const total = sorted.reduce((sum, d) => sum + d.totalMinutes, 0)

  list.innerHTML = sorted.map(d => `
    <li class="bar-row">
      <div class="bar-row-head">
        <strong>${escapeHtml(d.courseName)}</strong>
        <span class="bar-row-value"><span class="time-value">${formatMinutes(d.totalMinutes)}</span> · ${Math.round(d.totalMinutes / total * 100)}%</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width: ${d.totalMinutes / max * 100}%"></div></div>
    </li>
  `).join('')

  document.getElementById('course-count').textContent = data.length
}

/**
 * Renders a column chart of minutes studied per day for the last 14 days in
 * #daily-chart, with the best day labelled and a tooltip on hover and focus.
 *
 * @param {Array<{ date: string, duration: number }>} sessions - All of the user's sessions.
 * @returns {void}
 */
const renderDailyChart = (sessions) => {
  const chart = document.getElementById('daily-chart')
  const tooltip = document.getElementById('chart-tooltip')

  const days = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push({ date, key: toDayKey(date), minutes: 0 })
  }
  const byKey = new Map(days.map(d => [d.key, d]))
  sessions.forEach(s => {
    const day = byKey.get(String(s.date).slice(0, 10))
    if (day) day.minutes += s.duration
  })

  const total = days.reduce((sum, d) => sum + d.minutes, 0)
  const max = Math.max(...days.map(d => d.minutes))
  const best = max > 0 ? days.find(d => d.minutes === max) : null
  document.getElementById('daily-total').textContent = `${formatMinutes(total)} total`

  chart.innerHTML = days.map((d, i) => {
    const label = d.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    const height = max > 0 ? d.minutes / max * 100 : 0
    return `
      <div class="day-col${i === days.length - 1 ? ' is-today' : ''}" role="listitem" tabindex="0"
           aria-label="${label}: ${formatMinutes(d.minutes)}" data-tip="${label} · ${formatMinutes(d.minutes)}">
        <div class="day-plot">
          ${d === best ? `<span class="day-peak">${formatMinutes(d.minutes)}</span>` : ''}
          ${d.minutes > 0 ? `<div class="day-bar" style="height: ${height}%"></div>` : ''}
        </div>
        <span class="day-label">${d.date.getDate()}</span>
      </div>
    `
  }).join('')

  /**
   * Shows the tooltip above the given column.
   *
   * @param {HTMLElement} col - The hovered or focused column.
   */
  const showTip = (col) => {
    tooltip.textContent = col.dataset.tip
    tooltip.hidden = false
    const card = chart.parentElement.getBoundingClientRect()
    const box = col.getBoundingClientRect()
    const half = tooltip.offsetWidth / 2
    const center = box.left - card.left + box.width / 2
    tooltip.style.left = `${Math.min(Math.max(center, half), card.width - half)}px`
  }
  const hideTip = () => { tooltip.hidden = true }

  chart.querySelectorAll('.day-col').forEach(col => {
    col.addEventListener('pointerenter', () => showTip(col))
    col.addEventListener('focus', () => showTip(col))
    col.addEventListener('pointerleave', hideTip)
    col.addEventListener('blur', hideTip)
  })
}

/**
 * Fetches all sessions from the API (newest first), renders the 5 most
 * recent ones in the #recent-sessions list and the daily chart, and updates
 * the #week-total badge with the sum of minutes logged in the last 7 days.
 *
 * @async
 * @returns {Promise<void>}
 */
const loadRecentSessions = async () => {
  const res = await fetch('/api/sessions', { headers })
  const data = await res.json()
  const list = document.getElementById('recent-sessions')

  renderDailyChart(data)

  if (!data.length) {
    document.getElementById('week-total').textContent = '0m'
    return
  }

  const recent = data.slice(0, 5)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekTotal = data
    .filter(s => new Date(s.date) >= weekAgo)
    .reduce((sum, s) => sum + s.duration, 0)

  document.getElementById('week-total').textContent = formatMinutes(weekTotal)

  list.innerHTML = recent.map(s => `
    <li class="list-item">
      <div class="session-info">
        <strong>${escapeHtml(s.courseId?.name || 'Unknown')}</strong>
        <span class="session-meta">${new Date(s.date).toLocaleDateString('sv-SE')} · ${formatMinutes(s.duration)}</span>
        ${s.comment ? `<span class="session-comment">${escapeHtml(s.comment)}</span>` : ''}
      </div>
    </li>
  `).join('')
}

loadSummary()
loadRecentSessions()
