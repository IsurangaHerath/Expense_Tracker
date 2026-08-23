# 9 Security Requirements

## 9.1 Authentication Security

| Requirement ID | Description | Measure |
|----------------|-------------|---------|
| SEC-001 | Passwords must be hashed before storage | bcrypt with cost >= 12 |
| SEC-002 | Passwords must be encrypted in transit | HTTPS/TLS 1.2+ |
| SEC-003 | JWT tokens must have expiration | 24 hours maximum |
| SEC-004 | Failed login attempts limited | 5 per minute per IP |

## 9.2 Authorization Security

| Requirement ID | Description | Measure |
|----------------|-------------|---------|
| SEC-005 | Users cannot access other users' data | Row-level security check |
| SEC-006 | Expense ownership verified on all operations | Foreign key with user check |

## 9.3 Data Protection

| Requirement ID | Description | Measure |
|----------------|-------------|---------|
| SEC-007 | No sensitive data logged | Passwords, tokens excluded from logs |
| SEC-008 | Tokens never stored in plain text | Browser storage encrypted |

## 9.4 Input Security

| Requirement ID | Description | Measure |
|----------------|-------------|---------|
| SEC-009 | All inputs validated | Whitelist approach |
| SEC-010 | SQL injection prevented | Parameterized queries |
| SEC-011 | XSS prevented | Output encoding |

## 9.5 Session Security

| Requirement ID | Description | Measure |
|----------------|-------------|---------|
| SEC-012 | Secure cookies | HttpOnly, Secure flags |
| SEC-013 | Session fixation prevented | New token on login |
| SEC-014 | Logout invalidates session | Token removed |