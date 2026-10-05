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

describe('GET /health', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns 200 when the database is connected', async () => {
    jest.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1)

    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('returns 503 when the database is not connected', async () => {
    jest.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0)

    const res = await request(app).get('/health')

    expect(res.status).toBe(503)
    expect(res.body).toEqual({ status: 'db-unavailable' })
  })
})
