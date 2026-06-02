'use strict'

const User = require('../models/User')
const bcrypt = require('bcryptjs')

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile, excluding the password field.
 * Responds 404 if the user no longer exists.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

/**
 * PUT /api/users/profile
 * Updates the authenticated user's name, email, and optionally their password.
 * Responds 404 if the user no longer exists.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.body.name - New display name.
 * @param {string} req.body.email - New email address.
 * @param {string} [req.body.password] - New password; hashed before storage if provided.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const updateProfile = async (req, res) => {
  const { name, email, password } = req.body
  const update = { name, email }
  if (password) {
    update.password = await bcrypt.hash(password, 10)
  }
  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

/**
 * DELETE /api/users/profile
 * Permanently deletes the authenticated user's account.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.userId)
  res.json({ message: 'Account deleted' })
}

module.exports = { getProfile, updateProfile, deleteAccount }
