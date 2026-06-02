'use strict'

const mongoose = require('mongoose')

/**
 * Establishes a connection to MongoDB using the MONGO_URI environment variable.
 * Logs the connected host on success.
 *
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI)
  console.log(`MongoDB connected: ${conn.connection.host}`)
}

module.exports = connectDB
