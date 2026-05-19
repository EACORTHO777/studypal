'use strict'

const express = require('express')
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => res.redirect('/login.html'))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/courses', require('./routes/courseRoutes'))
app.use('/api/sessions', require('./routes/studySessionRoutes'))

app.use((err, req, res, _next) => {
  console.error(err.message)
  res.status(500).json({ message: 'Server error' })
})

module.exports = app
