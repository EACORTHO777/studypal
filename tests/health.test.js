'use strict'

/**
 * Tests for the health check endpoint used by the uptime monitor.
 *
 * The database connection state is stubbed so the tests run without MongoDB.
 *
 * Covered routes:
 *   GET /health
 */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')

/**
 * Mongoose declares readyState as a non-configurable getter, so it cannot be
 * spied on. An own property on the connection shadows it instead.
 *
 * @param {number} state - The readyState to report (1 = connected).
 */
const setReadyState = (state) => {
  Object.defineProperty(mongoose.connection, 'readyState', { value: state, configurable: true })
}

describe('GET /health', () => {
  afterEach(() => {
    delete mongoose.connection.readyState
  })

  it('returns 200 when the database is connected', async () => {
    setReadyState(1)

    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('returns 503 when the database is not connected', async () => {
    setReadyState(0)

    const res = await request(app).get('/health')

    expect(res.status).toBe(503)
    expect(res.body).toEqual({ status: 'db-unavailable' })
  })
})
