'use strict'

const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

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

const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  res.json({ token: generateToken(user._id), name: user.name })
}

module.exports = { register, login }
