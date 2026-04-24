'use strict'

const Course = require('../models/Course')

const getCourses = async (req, res) => {
  const courses = await Course.find({ userId: req.userId })
  res.json(courses)
}

const createCourse = async (req, res) => {
  const { name, code } = req.body
  const course = await Course.create({ name, code, userId: req.userId })
  res.status(201).json(course)
}

const updateCourse = async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { name: req.body.name, code: req.body.code },
    { new: true }
  )
  if (!course) return res.status(404).json({ message: 'Course not found' })
  res.json(course)
}

const deleteCourse = async (req, res) => {
  const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  if (!course) return res.status(404).json({ message: 'Course not found' })
  res.json({ message: 'Course deleted' })
}

module.exports = { getCourses, createCourse, updateCourse, deleteCourse }
