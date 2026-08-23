# 7 Use Cases

## UC-AUTH-001: User Registration

### Basic Flow
1. User navigates to registration page from login page
2. User enters email address
3. System validates email format
4. User enters and confirms password
5. System validates password requirements
6. User submits registration form
7. System checks for existing email
8. System hashes password with bcrypt
9. System creates user record in database
10. System redirects to login page with success message

### Alternative Flows
- A1: Email format invalid → System shows error message
- A2: Email already exists → System shows "Email already registered" message
- A3: Password too short → System shows password requirements
- A4: Password mismatch → System shows "Passwords do not match"

### Error Flows
- E1: Database connection failure → System shows "Unable to register. Please try again."
- E2: Server error → System shows generic error message

### Preconditions
- User has not already registered
- System is online
- Database is accessible

### Postconditions
- User account created with hashed password
- User can log in with credentials

---

## UC-AUTH-002: User Login

### Basic Flow
1. User navigates to login page
2. User enters email address
3. User enters password
4. User submits login form
5. System validates credentials against database
6. System generates JWT with user ID
7. System sets token in browser storage
8. System redirects to dashboard

### Alternative Flows
- A1: Invalid credentials → System shows "Invalid email or password"
- A2: Account not verified → System shows verification message

### Error Flows
- E1: Database connection failure → System shows "Login unavailable"
- E2: Token generation failure → System shows "Unable to complete login"

### Preconditions
- User has valid account
- System is online

### Postconditions
- User is authenticated
- JWT token available in browser

---

## UC-AUTH-003: User Logout

### Basic Flow
1. User clicks logout button
2. System clears JWT token from browser storage
3. System redirects to login page
4. Subsequent requests to protected pages redirect to login

### Preconditions
- User is authenticated
- JWT token exists

### Postconditions
- Session terminated
- User cannot access protected pages without re-authentication