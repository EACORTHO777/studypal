'use strict'

const mongoose = require('mongoose')

/**
 * @typedef {Object} UserDocument
 * @property {string} name - Display name of the user.
 * @property {string} email - Unique email address (stored lowercase).
 * @property {string} password - Bcrypt-hashed password.
 * @property {Date} createdAt - Auto-set by Mongoose timestamps.
 * @property {Date} updatedAt - Auto-set by Mongoose timestamps.
 */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
