'use strict'

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getProfile, updateProfile, deleteAccount } = require('../controllers/userController')

router.use(protect)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.delete('/profile', deleteAccount)

module.exports = router
