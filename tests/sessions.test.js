'use strict'

/**
 * Integration tests for the study session endpoints.
 *
 * The StudySession model and jsonwebtoken are mocked so the tests run without
 * a live database. Every request is authenticated as USER_ID.
 *
 * Covered routes:
 *   GET    /api/sessions
 *   GET    /api/sessions/summary
 *   POST   /api/sessions
 *   PUT    /api/sessions/:id
 *   DELETE /api/sessions/:id
 */

jest.mock('../src/models/StudySession', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  aggregate: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-token'),
  verify: jest.fn()
}))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const StudySession = require('../src/models/StudySession')

process.env.JWT_SECRET = 'test-secret'

const USER_ID = '64b7f0c2a1b2c3d4e5f60718'
const COURSE_ID = '64b7f0c2a1b2c3d4e5f60719'
const SESSION_ID = '64b7f0c2a1b2c3d4e5f6071a'
const AUTH = 'Bearer fake-token'

/**
 * Makes StudySession.find return a query whose sort().populate() chain
 * resolves to the given sessions, and returns the sort mock for assertions.
 *
 * @param {object[]} sessions - The sessions the query should resolve to.
 * @returns {{ sort: jest.Mock, populate: jest.Mock }} The chained query mocks.
 */
const mockFindChain = (sessions) => {
  const populate = jest.fn().mockResolvedValue(sessions)
  const sort = jest.fn().mockReturnValue({ populate })
  StudySession.find.mockReturnValue({ sort })
  return { sort, populate }
}

beforeEach(() => {
  jwt.verify.mockReturnValue({ id: USER_ID })
})

afterEach(() => jest.clearAllMocks())

describe('GET /api/sessions', () => {
  it('returns 401 when no token is sent', async () => {
    const res = await request(app).get('/api/sessions')

    expect(res.status).toBe(401)
    expect(StudySession.find).not.toHaveBeenCalled()
  })

  it('returns the current user\'s sessions, newest first, with course populated', async () => {
    const { sort, populate } = mockFindChain([
      { _id: SESSION_ID, duration: 45, courseId: { name: 'Calculus I', code: 'MA101' } }
    ])

    const res = await request(app).get('/api/sessions').set('Authorization', AUTH)

    expect(res.status).toBe(200)
    expect(res.body[0].courseId.name).toBe('Calculus I')
    expect(StudySession.find).toHaveBeenCalledWith({ userId: USER_ID })
    expect(sort).toHaveBeenCalledWith({ date: -1 })
    expect(populate).toHaveBeenCalledWith('courseId', 'name code')
  })
})

describe('GET /api/sessions/summary', () => {
  it('returns total minutes per course for the current user', async () => {
    StudySession.aggregate.mockResolvedValue([{ _id: COURSE_ID, courseName: 'Calculus I', totalMinutes: 120 }])

    const res = await request(app).get('/api/sessions/summary').set('Authorization', AUTH)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ _id: COURSE_ID, courseName: 'Calculus I', totalMinutes: 120 }])

    const [match] = StudySession.aggregate.mock.calls[0][0]
    expect(match.$match.userId.toString()).toBe(USER_ID)
  })
})

describe('POST /api/sessions', () => {
  it('returns 201 and creates the session for the current user', async () => {
    const body = { courseId: COURSE_ID, date: '2026-10-01', duration: 45, comment: 'Chapter 3' }
    StudySession.create.mockResolvedValue({ _id: SESSION_ID, ...body, userId: USER_ID })

    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', AUTH)
      .send({ ...body, userId: 'someone-else' })

    expect(res.status).toBe(201)
    expect(res.body.duration).toBe(45)
    expect(StudySession.create).toHaveBeenCalledWith({ ...body, userId: USER_ID })
  })
})

describe('PUT /api/sessions/:id', () => {
  it('returns 200 with the updated session', async () => {
    StudySession.findOneAndUpdate.mockResolvedValue({ _id: SESSION_ID, date: '2026-10-02', duration: 60, comment: '' })

    const res = await request(app)
      .put(`/api/sessions/${SESSION_ID}`)
      .set('Authorization', AUTH)
      .send({ date: '2026-10-02', duration: 60, comment: '' })

    expect(res.status).toBe(200)
    expect(res.body.duration).toBe(60)
    expect(StudySession.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: SESSION_ID, userId: USER_ID },
      { date: '2026-10-02', duration: 60, comment: '' },
      { new: true }
    )
  })

  it('returns 404 when the session does not exist or belongs to another user', async () => {
    StudySession.findOneAndUpdate.mockResolvedValue(null)

    const res = await request(app)
      .put(`/api/sessions/${SESSION_ID}`)
      .set('Authorization', AUTH)
      .send({ duration: 60 })

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Session not found')
  })
})

describe('DELETE /api/sessions/:id', () => {
  it('returns 200 when the session is deleted', async () => {
    StudySession.findOneAndDelete.mockResolvedValue({ _id: SESSION_ID })

    const res = await request(app).delete(`/api/sessions/${SESSION_ID}`).set('Authorization', AUTH)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Session deleted')
    expect(StudySession.findOneAndDelete).toHaveBeenCalledWith({ _id: SESSION_ID, userId: USER_ID })
  })

  it('returns 404 when the session does not exist or belongs to another user', async () => {
    StudySession.findOneAndDelete.mockResolvedValue(null)

    const res = await request(app).delete(`/api/sessions/${SESSION_ID}`).set('Authorization', AUTH)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Session not found')
  })
})
