# Requirements

Full issue tracking is managed in the [GitLab Project Hub](https://gitlab.lnu.se/1dv613/student/ac223up/project-hub/-/issues).
This document summarises the requirements and their implementation status.

---

## Functional Requirements — User Stories

| # | Requirement | Status |
|---|---|---|
| #7 | As a user I can register an account | ✅ Implemented |
| #8 | As a user I can log in to the application | ✅ Implemented |
| #9 | As a user I can view my profile | ✅ Implemented |
| #23 | As a user I can log out | ✅ Implemented |
| #12 | As a user I can log a study session | ✅ Implemented |
| #13 | As a user I can edit a logged study session | ✅ Implemented |
| #14 | As a user I can delete a logged study session | ✅ Implemented |
| #15 | As a user I can see total study time per course | ✅ Implemented |
| #16 | As a user I can see total study time per week | ✅ Implemented |
| #17 | As a user I can edit a course name | ✅ Implemented |
| #18 | As a user I can delete a course | ✅ Implemented |
| #24 | As a user I can view a dashboard with an overview of my study activity | ✅ Implemented |

---

## System Requirements

| # | Requirement | Status |
|---|---|---|
| #25 | Database schema for users, courses and study sessions | ✅ Implemented |
| #26 | REST API structure with MVC architecture | ✅ Implemented |
| #27 | JWT authentication middleware protecting all private routes | ✅ Implemented |
| #30 | Dockerfile and docker-compose for local development | ✅ Implemented |
| #31 | Production Docker setup | ✅ Implemented |
| #32 | Deployed to cloud server | ✅ Implemented |
| #34 | GitLab CI/CD pipeline (lint, test, deploy stages) | ✅ Implemented |
| #36 | Automated tests with Jest and Supertest | ✅ Implemented |
| #37 | Test stage in CI/CD pipeline | ✅ Implemented |

---

## Non-Functional Requirements

| # | Requirement | Status |
|---|---|---|
| #19 | Security — passwords hashed with bcrypt, sessions handled via JWT | ✅ Implemented |
| #20 | Usability — responsive mobile-first design | ✅ Implemented |
| #21 | Performance — dashboard summary loads within acceptable time | ✅ Implemented |
| #22 | GDPR — users can delete their account and all associated data | ✅ Implemented |
| #28 | Development environment documented and reproducible via Docker | ✅ Implemented |
