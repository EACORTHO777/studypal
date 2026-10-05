'use strict'

/**
 * Integration tests for the course endpoints.
 *
 * The Course model and jsonwebtoken are mocked so the tests run without a
 * live database. Every request is authenticated as USER_ID unless a test
 * checks the auth middleware itself.
 *
 * Covered routes:
 *   GET    /api/courses
 *   POST   /api/courses
 *   PUT    /api/courses/:id
 *   DELETE /api/courses/:id
 */

jest.mock('../src/models/Course', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-token'),
  verify: jest.fn()
}))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const Course = require('../src/models/Course')

/** The real model, used to produce the validation errors Mongoose would throw */
const RealCourse = jest.requireActual('../src/models/Course')

process.env.JWT_SECRET = 'test-secret'

const USER_ID = '64b7f0c2a1b2c3d4e5f60718'
const COURSE_ID = '64b7f0c2a1b2c3d4e5f60719'
const AUTH = 'Bearer fake-token'

beforeEach(() => {
  jwt.verify.mockReturnValue({ id: USER_ID })
})

afterEach(() => jest.clearAllMocks())

describe('auth middleware on /api/courses', () => {
  it('returns 401 when no token is sent', async () => {
    const res = await request(app).get('/api/courses')

    expect(res.status).toBe(401)
    expect(Course.find).not.toHaveBeenCalled()
  })

  it('returns 401 when the token is invalid', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed') })

    const res = await request(app).get('/api/courses').set('Authorization', AUTH)

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authorized')
    expect(Course.find).not.toHaveBeenCalled()
  })
})

describe('GET /api/courses', () => {
  it('returns only the current user\'s courses', async () => {
    Course.find.mockResolvedValue([{ _id: COURSE_ID, name: 'Calculus I', code: 'MA101' }])

    const res = await request(app).get('/api/courses').set('Authorization', AUTH)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Calculus I')
    expect(Course.find).toHaveBeenCalledWith({ userId: USER_ID })
  })
})

describe('POST /api/courses', () => {
  it('returns 201 and creates the course for the current user', async () => {
    Course.create.mockResolvedValue({ _id: COURSE_ID, name: 'Calculus I', code: 'MA101', userId: USER_ID })

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', AUTH)
      .send({ name: 'Calculus I', code: 'MA101', userId: 'someone-else' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Calculus I')
    expect(Course.create).toHaveBeenCalledWith({ name: 'Calculus I', code: 'MA101', userId: USER_ID })
  })

  it('returns 400 with a readable message when the name is missing', async () => {
    Course.create.mockRejectedValue(new RealCourse({ userId: USER_ID }).validateSync())

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', AUTH)
      .send({ code: 'MA101' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Course name is required')
  })

  it('returns 500 without details when something unexpected fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    Course.create.mockRejectedValue(new Error('connection reset'))

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', AUTH)
      .send({ name: 'Calculus I' })

    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Server error')
    console.error.mockRestore()
  })
})

describe('PUT /api/courses/:id', () => {
  it('returns 200 with the updated course', async () => {
    Course.findOneAndUpdate.mockResolvedValue({ _id: COURSE_ID, name: 'Calculus II', code: 'MA102' })

    const res = await request(app)
      .put(`/api/courses/${COURSE_ID}`)
      .set('Authorization', AUTH)
      .send({ name: 'Calculus II', code: 'MA102' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Calculus II')
    expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: COURSE_ID, userId: USER_ID },
      { name: 'Calculus II', code: 'MA102' },
      { new: true, runValidators: true }
    )
  })

  it('returns 404 when the course does not exist or belongs to another user', async () => {
    Course.findOneAndUpdate.mockResolvedValue(null)

    const res = await request(app)
      .put(`/api/courses/${COURSE_ID}`)
      .set('Authorization', AUTH)
      .send({ name: 'Calculus II' })

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Course not found')
  })

  it('returns 404 when the ID in the URL is malformed', async () => {
    Course.findOneAndUpdate.mockRejectedValue(new mongoose.Error.CastError('ObjectId', 'not-an-id', '_id'))

    const res = await request(app)
      .put('/api/courses/not-an-id')
      .set('Authorization', AUTH)
      .send({ name: 'Calculus II' })

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Not found')
  })
})

describe('DELETE /api/courses/:id', () => {
  it('returns 200 when the course is deleted', async () => {
    Course.findOneAndDelete.mockResolvedValue({ _id: COURSE_ID })

    const res = await request(app).delete(`/api/courses/${COURSE_ID}`).set('Authorization', AUTH)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Course deleted')
    expect(Course.findOneAndDelete).toHaveBeenCalledWith({ _id: COURSE_ID, userId: USER_ID })
  })

  it('returns 404 when the course does not exist or belongs to another user', async () => {
    Course.findOneAndDelete.mockResolvedValue(null)

    const res = await request(app).delete(`/api/courses/${COURSE_ID}`).set('Authorization', AUTH)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Course not found')
  })
})
