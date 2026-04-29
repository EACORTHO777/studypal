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
const form = document.getElementById('course-form')
const errorMsg = document.getElementById('error-msg')

document.getElementById('add-btn').addEventListener('click', () => {
  editingId = null
  document.getElementById('modal-title').textContent = 'Add course'
  document.getElementById('course-name').value = ''
  document.getElementById('course-code').value = ''
  errorMsg.textContent = ''
  modal.style.display = 'flex'
})

document.getElementById('cancel-btn').addEventListener('click', () => {
  modal.style.display = 'none'
})

const loadCourses = async () => {
  const res = await fetch('/api/courses', { headers })
  const courses = await res.json()
  const list = document.getElementById('course-list')

  if (!courses.length) {
    list.innerHTML = '<li class="empty-state">No courses yet. Add your first course!</li>'
    return
  }

  list.innerHTML = courses.map(c => `
    <li class="list-item">
      <div>
        <strong>${c.name}</strong>
        ${c.code ? `<span class="course-code">${c.code}</span>` : ''}
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openEdit('${c._id}', '${c.name}', '${c.code || ''}')">Edit</button>
        <button class="btn-delete" onclick="deleteCourse('${c._id}')">Delete</button>
      </div>
    </li>
  `).join('')
}

const openEdit = (id, name, code) => {
  editingId = id
  document.getElementById('modal-title').textContent = 'Edit course'
  document.getElementById('course-name').value = name
  document.getElementById('course-code').value = code
  errorMsg.textContent = ''
  modal.style.display = 'flex'
}

const deleteCourse = async (id) => {
  if (!confirm('Delete this course?')) return
  await fetch(`/api/courses/${id}`, { method: 'DELETE', headers })
  loadCourses()
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorMsg.textContent = ''

  const name = document.getElementById('course-name').value
  const code = document.getElementById('course-code').value

  const url = editingId ? `/api/courses/${editingId}` : '/api/courses'
  const method = editingId ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify({ name, code })
  })

  const data = await res.json()
  if (!res.ok) {
    errorMsg.textContent = data.message || 'Something went wrong'
    return
  }

  modal.style.display = 'none'
  loadCourses()
})

loadCourses()
