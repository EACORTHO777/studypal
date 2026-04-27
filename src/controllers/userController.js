'use strict'

const User = require('../models/User')
const bcrypt = require('bcryptjs')

const getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

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

const deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.userId)
  res.json({ message: 'Account deleted' })
}

module.exports = { getProfile, updateProfile, deleteAccount }
