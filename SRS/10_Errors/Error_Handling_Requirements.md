# 10 Error Handling Requirements

## 10.1 General Error Handling Principles

| Principle | Description |
|-----------|-------------|
| User-Friendly | Errors in plain language, no technical jargon |
| Specific | Clear indication of which field has error |
| Recoverable | Guidance on how to fix the error |

## 10.2 Authentication Errors

| Error | Condition | Handling |
|-------|-----------|----------|
| Invalid credentials | Wrong email/password | "Invalid email or password" message |
| Account locked | Too many failed attempts | "Account temporarily locked" with retry time |
| Session expired | JWT expired | Redirect to login with message |

## 10.3 Input Validation Errors

| Error Type | Condition | Handling |
|------------|-----------|----------|
| Invalid email format | Not matching email regex | "Please enter valid email address" |
| Password too short | < 8 characters | "Password must be at least 8 characters" |
| Amount invalid | <= 0 or not a number | "Enter valid positive amount" |
| Date in future | Date > today | "Date cannot be in the future" |

## 10.4 System Errors

| Error | Condition | Handling |
|-------|-----------|----------|
| Database unavailable | Connection failed | "System temporarily unavailable" |
| Network error | API timeout | "Unable to connect. Please try again" |
| Server error | 500 response | Generic "Something went wrong" message |

## 10.5 Error Response Format

All API errors shall follow this JSON structure:

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION|AUTHENTICATION|SYSTEM",
    "message": "Human readable error description",
    "field": "fieldName (optional)",
    "code": "ERROR_CODE"
  }
}
```

## 10.6 Error Logging

| Error Type | Logged? | Data Stored |
|------------|---------|-------------|
| Authentication failures | Yes | Timestamp, IP, email attempted |
| Validation errors | No | N/A |
| System errors | Yes | Stack trace, context (no sensitive data) |
| Database errors | Yes | Query, error message |