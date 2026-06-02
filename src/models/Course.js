'use strict'

const mongoose = require('mongoose')

/**
 * @typedef {Object} CourseDocument
 * @property {string} name - Full course name (e.g. "Calculus I").
 * @property {string} [code] - Optional course code (e.g. "MATH101").
 * @property {mongoose.Types.ObjectId} userId - Reference to the owning User.
 * @property {Date} createdAt - Auto-set by Mongoose timestamps.
 * @property {Date} updatedAt - Auto-set by Mongoose timestamps.
 */

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)
