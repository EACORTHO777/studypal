'use strict'

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getProfile, updateProfile, deleteAccount } = require('../controllers/userController')

/** All user routes require a valid JWT */
router.use(protect)

/** GET    /api/users/profile — fetch the current user's profile */
router.get('/profile', getProfile)

/** PUT    /api/users/profile — update the current user's profile */
router.put('/profile', updateProfile)

/** DELETE /api/users/profile — permanently delete the current user's account */
router.delete('/profile', deleteAccount)

module.exports = router
