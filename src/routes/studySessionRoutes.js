'use strict'

const express = require('express')
const router = express.Router()
const { getSessions, createSession, updateSession, deleteSession, getSummary } = require('../controllers/studySessionController')
const { protect } = require('../middleware/auth')

/** All session routes require a valid JWT */
router.use(protect)

/** GET    /api/sessions/summary — aggregated minutes per course */
router.get('/summary', getSummary)

/** GET    /api/sessions         — list all sessions for the current user */
router.get('/', getSessions)

/** POST   /api/sessions         — log a new study session */
router.post('/', createSession)

/** PUT    /api/sessions/:id     — update a session by ID */
router.put('/:id', updateSession)

/** DELETE /api/sessions/:id     — delete a session by ID */
router.delete('/:id', deleteSession)

module.exports = router
