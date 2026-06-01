'use strict'

const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'

document.getElementById('user-name').textContent = localStorage.getItem('name') || ''
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('name')
  window.location.href = 'login.html'
})

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
}

let editingId = null
const modal = document.getElementById('modal')
const form = document.getElementById('session-form')
const errorMsg = document.getElementById('error-msg')

const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const loadCourses = async () => {
  const res = await fetch('/api/courses', { headers })
  const courses = await res.json()
  const select = document.getElementById('course-select')
  select.innerHTML = '<option value="">Select a course</option>'
  courses.forEach(c => {
    select.innerHTML += `<option value="${c._id}">${c.name}</option>`
  })
}

const loadSessions = async () => {
  const res = await fetch('/api/sessions', { headers })
  const sessions = await res.json()
  const list = document.getElementById('session-list')

  if (!sessions.length) {
    list.innerHTML = '<li class="empty-state">No sessions logged yet.<br>Hit <strong>+ Log session</strong> to track your first study session.</li>'
    return
  }

  list.innerHTML = sessions.reverse().map(s => `
    <li class="list-item">
      <div class="session-info">
        <strong>${s.courseId?.name || 'Unknown'}</strong>
        <span class="session-meta">${new Date(s.date).toLocaleDateString('sv-SE')} · ${formatMinutes(s.duration)}</span>
        ${s.comment ? `<span class="session-comment">${s.comment}</span>` : ''}
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openEdit('${s._id}', '${s.courseId?._id}', '${s.date.slice(0, 10)}', ${s.duration}, '${s.comment || ''}')">Edit</button>
        <button class="btn-delete" onclick="deleteSession('${s._id}')">Delete</button>
      </div>
    </li>
  `).join('')
}

document.getElementById('add-btn').addEventListener('click', () => {
  editingId = null
  document.getElementById('modal-title').textContent = 'Log session'
  form.reset()
  document.getElementById('session-date').value = new Date().toISOString().slice(0, 10)
  errorMsg.textContent = ''
  modal.style.display = 'flex'
})

document.getElementById('cancel-btn').addEventListener('click', () => {
  modal.style.display = 'none'
})

const openEdit = (id, courseId, date, duration, comment) => {
  editingId = id
  document.getElementById('modal-title').textContent = 'Edit session'
  document.getElementById('course-select').value = courseId
  document.getElementById('session-date').value = date
  document.getElementById('session-duration').value = duration
  document.getElementById('session-comment').value = comment
  errorMsg.textContent = ''
  modal.style.display = 'flex'
}

const askConfirm = () => new Promise((resolve) => {
  const overlay = document.getElementById('confirm-modal')
  overlay.style.display = 'flex'
  const ok = document.getElementById('confirm-ok')
  const cancel = document.getElementById('confirm-cancel')
  const cleanup = (result) => {
    overlay.style.display = 'none'
    ok.removeEventListener('click', onOk)
    cancel.removeEventListener('click', onCancel)
    resolve(result)
  }
  const onOk = () => cleanup(true)
  const onCancel = () => cleanup(false)
  ok.addEventListener('click', onOk)
  cancel.addEventListener('click', onCancel)
})

const deleteSession = async (id) => {
  if (!await askConfirm()) return
  await fetch(`/api/sessions/${id}`, { method: 'DELETE', headers })
  loadSessions()
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorMsg.textContent = ''

  const courseId = document.getElementById('course-select').value
  const date = document.getElementById('session-date').value
  const duration = parseInt(document.getElementById('session-duration').value)
  const comment = document.getElementById('session-comment').value

  const url = editingId ? `/api/sessions/${editingId}` : '/api/sessions'
  const method = editingId ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify({ courseId, date, duration, comment })
  })

  const data = await res.json()
  if (!res.ok) {
    errorMsg.textContent = data.message || 'Something went wrong'
    return
  }

  modal.style.display = 'none'
  loadSessions()
})

loadCourses()
loadSessions()
