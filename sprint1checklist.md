# Sprint 1 Checklist - Analyse & Cadrage

Sprint goal: set up the development environment, validate the functional scope, and implement the base authentication foundation.

Status legend:

- `[ ]` To do
- `[x]` Done
- `[~]` Partial
- `[!]` Blocked

## US-001 - Development Environment

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-001.1 | Create project folder structure | FS | 2h | Created backend, frontend, tests, Alembic, and docs folders |
| [x] | T-001.2 | Initialize Git repository | Git | 1h | Root Git repository initialized |
| [x] | T-001.3 | Configure Python virtual environment docs | Python | 2h | Commands documented in root README |
| [x] | T-001.4 | Create base Docker files | Docker | 4h | Added backend Dockerfile, frontend Dockerfile, and app compose |
| [x] | T-001.5 | Write README.md | Markdown | 3h | Added install, run, test, Docker, and sprint tracking notes |
| [x] | T-001.6 | Configure .gitignore and .env.example | Git | 1h | Added root `.gitignore` and `.env.example` |
| [x] | T-001.7 | Test environment consistency | Test | 3h | Verified through Docker build, containerized pytest, and `/health` check |

## US-002 - User Registration

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-002.1 | Create User data model | SQLAlchemy | 2h | Added `User` model and `UserRole` enum |
| [x] | T-002.2 | Create initial database migration | Alembic | 1h | Added initial auth/audit migration |
| [x] | T-002.3 | Implement POST /auth/register | FastAPI | 4h | Added `/auth/register` endpoint |
| [x] | T-002.4 | Implement password hashing | bcrypt/passlib | 2h | Added Passlib/bcrypt hashing helpers |
| [x] | T-002.5 | Create registration frontend form | React | 4h | Added registration page |
| [x] | T-002.6 | Validate registration inputs | Frontend | 2h | Added Zod validation |
| [x] | T-002.7 | Configure email confirmation mock | SMTP/mock | 2h | Added development email mock service |
| [x] | T-002.8 | Add registration unit tests | pytest | 3h | Passed in Docker with backend test suite |

## US-003 - Secure Login

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-003.1 | Implement POST /auth/login | FastAPI | 3h | Added `/auth/login` endpoint |
| [x] | T-003.2 | Implement JWT generation | PyJWT/python-jose | 3h | Added PyJWT token creation/validation |
| [x] | T-003.3 | Create authentication middleware/dependency | FastAPI | 3h | Added current-user and admin dependencies |
| [x] | T-003.4 | Create login frontend form | React | 4h | Added login page |
| [x] | T-003.5 | Store token client-side | JS | 2h | Added MVP localStorage token handling |
| [x] | T-003.6 | Implement logout | Fullstack | 2h | Added backend logout and frontend token removal |
| [~] | T-003.7 | Add brute-force protection placeholder | Slowapi/Redis | 2h | Documented; implementation deferred |
| [x] | T-003.8 | Add authentication integration tests | pytest | 1h | Passed in Docker with backend test suite |

## US-004 - Login Audit Logs

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-004.1 | Create AuditLog data model | SQLAlchemy | 2h | Added `AuditLog` model |
| [x] | T-004.2 | Create audit log migration | Alembic | 1h | Included in initial migration |
| [x] | T-004.3 | Log authentication endpoints | Python logging | 3h | Added register/login/logout audit writes |
| [x] | T-004.4 | Capture client IP address | FastAPI | 1h | Added client IP helper |
| [x] | T-004.5 | Implement admin GET /audit-logs | FastAPI | 2h | Added admin-only endpoint |
| [x] | T-004.6 | Define log retention policy | Config | 1h | Added config and security docs |
| [x] | T-004.7 | Add audit logging tests | pytest | 2h | Passed in Docker with backend test suite |

## US-005 - Functional Specifications

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-005.1 | Write functional requirements | Markdown | 3h | Added `app/docs/specifications.md` |
| [x] | T-005.2 | Write non-functional requirements | Markdown | 2h | Added `app/docs/specifications.md` |
| [x] | T-005.3 | Create UML/use-case diagrams | Mermaid/PlantUML | 2h | Added Mermaid use-case diagram |
| [x] | T-005.4 | Document usage scenarios | Markdown | 2h | Added registration/login/audit scenarios |
| [ ] | T-005.5 | Review with supervisor | Meeting | 1h | Manual task |

## Sprint 1 Risks

| Status | ID | Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- | --- | --- |
| [x] | R-001 | Docker configuration issues | Medium | Medium | Mitigated: Docker build, tests, and backend run succeeded |
| [ ] | R-002 | Supervisor validation delays | High | Medium | Schedule fixed weekly review |
| [ ] | R-003 | JWT/security complexity | Medium | Low | Use proven FastAPI security libraries |
| [ ] | R-004 | Sprint too ambitious | High | Medium | Prioritize must-have auth foundation |

## Definition of Done

| Status | Criterion | Verification |
| --- | --- | --- |
| [x] | Code | Implemented and kept in the workspace |
| [x] | Tests | Backend tests pass in Docker |
| [x] | Review | Code is organized and ready for review |
| [x] | Documentation | README and docs updated |
| [x] | Demo | Backend runs in Docker and responds on `/health` |
| [x] | Thesis | Specification material available for the report |
