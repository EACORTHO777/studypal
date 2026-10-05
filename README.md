# StudyPal

A web application for tracking study sessions across courses. Log time spent studying, manage your courses, and get a weekly overview of your progress.

**Live demo:** https://studypal-dpft.onrender.com/
> Hosted on Render's free tier. The server sleeps when inactive, so the first load may take up to a minute.

**GitHub:** https://github.com/EACORTHO777/studypal

**Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)

---

## Features

- **Authentication** — register and log in with email and password (JWT-based, bcrypt-hashed passwords)
- **Course management** — add, edit and delete courses with an optional course code
- **Study session logging** — log study sessions with date, duration and an optional comment
- **Dashboard** — weekly study total and a per-course time breakdown
- **PWA** — installable on mobile and desktop, works offline for cached pages
- **Responsive UI** — mobile-first design with a collapsible sidebar

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | Vanilla HTML/CSS/JS |
| Testing | Jest + Supertest |
| Linting | ESLint |
| CI/CD | GitHub Actions + GitLab CI |
| Deployment | Render / Docker |

---

## Running locally

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Setup

```bash
# Install dependencies
npm install

# Create a .env file
cp .env.example .env   # or create manually (see below)

# Start the server
npm start
```

**.env** file should contain:

```
MONGO_URI=mongodb://localhost:27017/studypal
JWT_SECRET=your_secret_here
PORT=3000
```

The app will be available at `http://localhost:3000`.

---

## Running with Docker

```bash
# Development (with hot reload)
npm run docker:dev

# Production
docker compose -f docker-compose.yaml -f docker-compose.production.yaml up --build
```

---

## Tests

```bash
npm test
```

Tests use Jest and Supertest. All external dependencies (Mongoose, bcryptjs, jsonwebtoken) are mocked so no database connection is required.

---

## Linting

```bash
npm run lint
```

---

## Project structure

```
studypal/
├── .github/workflows/       ← GitHub Actions CI
├── docs/                    ← Mind map and other docs
├── public/                  ← Frontend (HTML, CSS, JS, PWA)
│   ├── css/
│   ├── js/
│   └── sw.js                ← Service worker
├── src/
│   ├── config/
│   │   └── db.js            ← MongoDB connection
│   ├── controllers/         ← Route handlers
│   ├── middleware/
│   │   └── auth.js          ← JWT middleware
│   ├── models/              ← Mongoose schemas
│   ├── routes/              ← Express routers
│   ├── app.js               ← Express app setup
│   └── server.js            ← Entry point
├── tests/                   ← Jest test suites
├── Dockerfile               ← Development image
├── Dockerfile.production    ← Production image
└── docker-compose.yaml      ← Base compose config
```

---

## API

All endpoints under `/api/courses`, `/api/sessions` and `/api/users` require a `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile |
| DELETE | `/api/users/profile` | Delete account |
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Create a course |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Log a session |
| PUT | `/api/sessions/:id` | Update a session |
| DELETE | `/api/sessions/:id` | Delete a session |
| GET | `/api/sessions/summary` | Aggregated minutes per course |

---

## Project status

### Implemented

- User registration and login with hashed passwords and JWT sessions
- Full CRUD for courses and study sessions
- Dashboard with weekly total and per-course breakdown
- PWA with service worker caching and offline support
- Mobile responsive UI with hamburger sidebar
- JWT-protected REST API
- Automated tests for auth endpoints (Jest + Supertest)
- GitHub Actions workflow running lint and tests on every push
- GitLab CI/CD pipeline with lint, test and deploy stages
- Dockerised for both development and production

### Not implemented / future improvements

- Tests for course and session endpoints
- Password reset via email
- Study goals and targets per course
- Data visualisation (charts)
- Export study data (CSV/PDF)
- Social features (study groups, shared goals)

### Test status

| Suite | Tests | Status |
|---|---|---|
| Auth endpoints | 5 | ✅ Passing |
| Sanity | 1 | ✅ Passing |

---

## Ethical considerations

- Passwords are hashed with bcrypt (salt rounds: 10) — plaintext passwords are never stored
- Authentication tokens expire after 7 days
- All data endpoints are protected by JWT — users can only access their own data
- No third-party analytics or tracking scripts
- No personal data beyond name and email is collected
