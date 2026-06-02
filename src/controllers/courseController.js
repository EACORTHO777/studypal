'use strict'

const Course = require('../models/Course')

/**
 * GET /api/courses
 * Returns all courses belonging to the authenticated user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const getCourses = async (req, res) => {
  const courses = await Course.find({ userId: req.userId })
  res.json(courses)
}

/**
 * POST /api/courses
 * Creates a new course for the authenticated user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.body.name - Course name.
 * @param {string} [req.body.code] - Optional course code.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const createCourse = async (req, res) => {
  const { name, code } = req.body
  const course = await Course.create({ name, code, userId: req.userId })
  res.status(201).json(course)
}

/**
 * PUT /api/courses/:id
 * Updates the name and code of a course owned by the authenticated user.
 * Responds 404 if the course does not exist or belongs to another user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.params.id - Course ID to update.
 * @param {string} req.body.name - New course name.
 * @param {string} [req.body.code] - New course code.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const updateCourse = async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { name: req.body.name, code: req.body.code },
    { new: true }
  )
  if (!course) return res.status(404).json({ message: 'Course not found' })
  res.json(course)
}

/**
 * DELETE /api/courses/:id
 * Deletes a course owned by the authenticated user.
 * Responds 404 if the course does not exist or belongs to another user.
 *
 * @async
 * @param {import('express').Request & { userId: string }} req - Express request, extended with userId from auth middleware.
 * @param {string} req.params.id - Course ID to delete.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 */
const deleteCourse = async (req, res) => {
  const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  if (!course) return res.status(404).json({ message: 'Course not found' })
  res.json({ message: 'Course deleted' })
}

module.exports = { getCourses, createCourse, updateCourse, deleteCourse }
