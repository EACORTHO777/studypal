'use strict'

const mongoose = require('mongoose')

/**
 * @typedef {Object} StudySessionDocument
 * @property {mongoose.Types.ObjectId} courseId - Reference to the associated Course.
 * @property {mongoose.Types.ObjectId} userId - Reference to the owning User.
 * @property {Date} date - Date the study session took place.
 * @property {number} duration - Duration in minutes (minimum 1).
 * @property {string} [comment] - Optional free-text note about the session.
 * @property {Date} createdAt - Auto-set by Mongoose timestamps.
 * @property {Date} updatedAt - Auto-set by Mongoose timestamps.
 */

const studySessionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('StudySession', studySessionSchema)
