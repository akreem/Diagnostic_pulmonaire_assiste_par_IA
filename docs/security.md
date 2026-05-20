# Security Notes - Sprint 1

## Authentication

- Passwords are hashed with Passlib/bcrypt.
- JWT access tokens use HS256 and a configurable `SECRET_KEY`.
- The MVP stores short-lived access tokens client-side. Production should prefer secure refresh-token rotation and careful cookie settings.

## Audit Logging

The backend records authentication events:

- `register_success`
- `register_failed`
- `login_success`
- `login_failed`
- `logout`

Audit entries include timestamp, actor user ID when available, action, resource, IP address, user agent, and metadata.

## Retention Policy

Sprint 1 defines `AUDIT_LOG_RETENTION_DAYS=365` as the default retention period. The actual purge job is deferred until later security hardening.

## Brute-Force Protection

The checklist keeps brute-force protection as a Sprint 1 hardening task. The intended implementation is `SlowAPI` or Redis-backed rate limiting around `/auth/login`.

