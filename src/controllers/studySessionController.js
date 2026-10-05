'use strict'

const mongoose = require('mongoose')
const StudySession = require('../models/StudySession')

/**
 * GET /api/sessions
 * Returns all study sessions for the authenticated user, with course name and code populated.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const getSessions = async (req, res) => {
  const sessions = await StudySession.find({ userId: req.userId })
    .sort({ date: -1 })
    .populate('courseId', 'name code')
  res.json(sessions)
}

/**
 * POST /api/sessions
 * Logs a new study session for the authenticated user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.body.courseId - ID of the course studied.
 * @param {string} req.body.date - ISO date string of the session.
 * @param {number} req.body.duration - Duration in minutes.
 * @param {string} [req.body.comment] - Optional session note.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const createSession = async (req, res) => {
  const { courseId, date, duration, comment } = req.body
  const session = await StudySession.create({ courseId, date, duration, comment, userId: req.userId })
  res.status(201).json(session)
}

/**
 * PUT /api/sessions/:id
 * Updates a study session owned by the authenticated user.
 * Responds 404 if the session does not exist or belongs to another user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.params.id - Session ID to update.
 * @param {string} req.body.date - New ISO date string.
 * @param {number} req.body.duration - New duration in minutes.
 * @param {string} [req.body.comment] - Updated session note.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const updateSession = async (req, res) => {
  const { date, duration, comment } = req.body
  const session = await StudySession.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { date, duration, comment },
    { new: true }
  )
  if (!session) return res.status(404).json({ message: 'Session not found' })
  res.json(session)
}

/**
 * DELETE /api/sessions/:id
 * Deletes a study session owned by the authenticated user.
 * Responds 404 if the session does not exist or belongs to another user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.params.id - Session ID to delete.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const deleteSession = async (req, res) => {
  const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  if (!session) return res.status(404).json({ message: 'Session not found' })
  res.json({ message: 'Session deleted' })
}

/**
 * GET /api/sessions/summary
 * Aggregates total study minutes per course for the authenticated user.
 * Returns an array of { courseName, totalMinutes } objects.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const getSummary = async (req, res) => {
  const sessions = await StudySession.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
    { $group: { _id: '$courseId', totalMinutes: { $sum: '$duration' } } },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' },
    { $project: { courseName: '$course.name', totalMinutes: 1 } }
  ])
  res.json(sessions)
}

module.exports = { getSessions, createSession, updateSession, deleteSession, getSummary }
