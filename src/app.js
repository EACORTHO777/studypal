'use strict'

const express = require('express')
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

/** Redirect bare root to the login page */
app.get('/', (req, res) => res.redirect('/login.html'))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/courses', require('./routes/courseRoutes'))
app.use('/api/sessions', require('./routes/studySessionRoutes'))

/**
 * Global error handler — catches unhandled errors from route handlers
 * and returns a generic 500 so stack traces never reach the client.
 *
 * @param {Error} err - The error thrown by a route handler.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} _next - Required fourth argument for Express to recognise this as an error handler.
 */
app.use((err, req, res, _next) => {
  console.error(err.message)
  res.status(500).json({ message: 'Server error' })
})

module.exports = app
