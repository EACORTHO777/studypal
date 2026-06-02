'use strict'

require('dotenv').config()

const connectDB = require('./config/db')
const app = require('./app')

const PORT = process.env.PORT || 3000

/** Connect to MongoDB, then start the HTTP server */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
