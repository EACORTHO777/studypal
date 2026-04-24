'use strict'

const express = require('express')
const router = express.Router()
const { getSessions, createSession, updateSession, deleteSession, getSummary } = require('../controllers/studySessionController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/summary', getSummary)
router.get('/', getSessions)
router.post('/', createSession)
router.put('/:id', updateSession)
router.delete('/:id', deleteSession)

module.exports = router
