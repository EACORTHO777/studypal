'use strict'

const express = require('express')
const path = require('path')
const connectDB = require('./config/db')

require('dotenv').config()

const app = express()

connectDB()

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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
