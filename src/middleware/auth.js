'use strict'

const jwt = require('jsonwebtoken')

/**
 * Express middleware that validates a Bearer JWT from the Authorization header.
 * Attaches the decoded user ID to `req.userId` and calls `next()` on success.
 * Responds 401 if the token is missing or invalid.
 *
 * @param {import('express').Request & { userId?: string }} req - Express request, extended with userId once verified.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
  } catch {
    return res.status(401).json({ message: 'Not authorized' })
  }
  next()
}

module.exports = { protect }
