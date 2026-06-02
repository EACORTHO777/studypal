'use strict'

const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * Signs a JWT for the given user ID with a 7-day expiry.
 *
 * @param {string} id - MongoDB ObjectId of the user.
 * @returns {string} Signed JWT string.
 */
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

/**
 * POST /api/auth/register
 * Creates a new user account. Returns a JWT and the user's display name.
 * Responds 400 if the email is already registered.
 *
 * @async
 * @param {import('express').Request} req - Express request.
 * @param {string} req.body.name - Display name for the new account.
 * @param {string} req.body.email - Email address (must be unique).
 * @param {string} req.body.password - Plaintext password to hash and store.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const register = async (req, res) => {
  const { name, email, password } = req.body
  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' })
  }
  const hashed = await bcrypt.hash(password, 10)
  try {
    const user = await User.create({ name, email, password: hashed })
    res.status(201).json({ token: generateToken(user._id), name: user.name })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' })
    }
    throw err
  }
}

/**
 * POST /api/auth/login
 * Authenticates a user with email and password. Returns a JWT and display name.
 * Responds 401 on invalid credentials.
 *
 * @async
 * @param {import('express').Request} req - Express request.
 * @param {string} req.body.email - Registered email address.
 * @param {string} req.body.password - Plaintext password to verify.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  res.json({ token: generateToken(user._id), name: user.name })
}

module.exports = { register, login }
