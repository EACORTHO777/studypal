'use strict'

const mongoose = require('mongoose')

const studySessionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('StudySession', studySessionSchema)
