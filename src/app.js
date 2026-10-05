'use strict'

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

/** Parse JSON and URL-encoded request bodies, and serve the frontend from public/ */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

/**
 * Health check for uptime monitors. Returns 200 when the database is
 * connected and 503 otherwise, so a paused database shows up as downtime.
 */
app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1
  res.status(dbConnected ? 200 : 503).json({ status: dbConnected ? 'ok' : 'db-unavailable' })
})

/** Redirect bare root to the login page */
app.get('/', (req, res) => res.redirect('/login.html'))

/** API routes */
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
