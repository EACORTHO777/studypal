'use strict'

const mongoose = require('mongoose')
const StudySession = require('../models/StudySession')

const getSessions = async (req, res) => {
  const sessions = await StudySession.find({ userId: req.userId }).populate('courseId', 'name code')
  res.json(sessions)
}

const createSession = async (req, res) => {
  const { courseId, date, duration, comment } = req.body
  const session = await StudySession.create({ courseId, date, duration, comment, userId: req.userId })
  res.status(201).json(session)
}

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

const deleteSession = async (req, res) => {
  const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  if (!session) return res.status(404).json({ message: 'Session not found' })
  res.json({ message: 'Session deleted' })
}

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
