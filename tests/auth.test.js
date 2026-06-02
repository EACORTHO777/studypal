'use strict'

/**
 * Integration tests for the authentication endpoints.
 *
 * All external dependencies (Mongoose models, bcryptjs, jsonwebtoken) are
 * mocked so the tests run without a live database or real crypto operations.
 *
 * Covered routes:
 *   POST /api/auth/register
 *   POST /api/auth/login
 */

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-token'),
  verify: jest.fn(() => ({ id: 'abc' }))
}))

const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')
const bcrypt = require('bcryptjs')

process.env.JWT_SECRET = 'test-secret'

afterEach(() => jest.clearAllMocks())

describe('POST /api/auth/register', () => {
  it('returns 201 with a token when user is created', async () => {
    User.findOne.mockResolvedValue(null)
    bcrypt.hash.mockResolvedValue('hashedpw')
    User.create.mockResolvedValue({ _id: 'abc', name: 'Alex' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alex', email: 'alex@test.com', password: 'pass123' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.name).toBe('Alex')
  })

  it('returns 400 when email is already registered', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alex', email: 'taken@test.com', password: 'pass123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Email already in use')
  })
})

describe('POST /api/auth/login', () => {
  it('returns 200 with a token when credentials are correct', async () => {
    User.findOne.mockResolvedValue({ _id: 'abc', name: 'Alex', password: 'hashedpw' })
    bcrypt.compare.mockResolvedValue(true)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@test.com', password: 'pass123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('returns 401 when password is wrong', async () => {
    User.findOne.mockResolvedValue({ _id: 'abc', name: 'Alex', password: 'hashedpw' })
    bcrypt.compare.mockResolvedValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@test.com', password: 'wrongpass' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('returns 401 when user is not found', async () => {
    User.findOne.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'any' })

    expect(res.status).toBe(401)
  })
})
