'use strict'

const express = require('express')
const router = express.Router()
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController')
const { protect } = require('../middleware/auth')

/** All course routes require a valid JWT */
router.use(protect)

/** GET    /api/courses      — list all courses for the current user */
router.get('/', getCourses)

/** POST   /api/courses      — create a new course */
router.post('/', createCourse)

/** PUT    /api/courses/:id  — update a course by ID */
router.put('/:id', updateCourse)

/** DELETE /api/courses/:id  — delete a course by ID */
router.delete('/:id', deleteCourse)

module.exports = router
