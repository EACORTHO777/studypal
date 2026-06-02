'use strict'

const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'

document.getElementById('user-name').textContent = localStorage.getItem('name') || ''

/** Clears auth state and redirects to the login page */
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('name')
  window.location.href = 'login.html'
})

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
}

/** ID of the course currently being edited, or null when adding a new one */
let editingId = null

const modal = document.getElementById('modal')
const form = document.getElementById('course-form')
const errorMsg = document.getElementById('error-msg')

/** Opens the modal in "add" mode with blank fields */
document.getElementById('add-btn').addEventListener('click', () => {
  editingId = null
  document.getElementById('modal-title').textContent = 'Add course'
  document.getElementById('course-name').value = ''
  document.getElementById('course-code').value = ''
  errorMsg.textContent = ''
  modal.style.display = 'flex'
})

/** Closes the course modal without saving */
document.getElementById('cancel-btn').addEventListener('click', () => {
  modal.style.display = 'none'
})

/**
 * Fetches all courses for the current user and renders them in the #course-list.
 * Shows an empty-state message when there are no courses.
 *
 * @async
 * @returns {Promise<void>}
 */
const loadCourses = async () => {
  const res = await fetch('/api/courses', { headers })
  const courses = await res.json()
  const list = document.getElementById('course-list')

  if (!courses.length) {
    list.innerHTML = '<li class="empty-state">No courses yet.<br>Hit <strong>+ Add course</strong> to get started.</li>'
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

/**
 * Opens the modal pre-filled with the given course data for editing.
 *
 * @param {string} id - MongoDB ObjectId of the course.
 * @param {string} name - Current course name.
 * @param {string} [code] - Current course code (empty string if not set).
 */
const openEdit = (id, name, code) => {
  editingId = id
  document.getElementById('modal-title').textContent = 'Edit course'
  document.getElementById('course-name').value = name
  document.getElementById('course-code').value = code
  errorMsg.textContent = ''
  modal.style.display = 'flex'
}

/**
 * Shows the confirmation modal and waits for the user to respond.
 * Cleans up its own event listeners after settling.
 *
 * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled.
 */
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

/**
 * Asks for confirmation, then deletes the specified course and refreshes the list.
 *
 * @async
 * @param {string} id - MongoDB ObjectId of the course to delete.
 * @returns {Promise<void>}
 */
const deleteCourse = async (id) => {
  if (!await askConfirm()) return
  await fetch(`/api/courses/${id}`, { method: 'DELETE', headers })
  loadCourses()
}

/**
 * Handles the course form submission for both create and edit operations.
 * Sends POST (new) or PUT (edit) depending on whether editingId is set.
 *
 * @param {SubmitEvent} e
 */
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
