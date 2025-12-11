# Authentication Middleware - Test Coverage Summary

## Overview
Comprehensive test suite for the authentication middleware with **21 test cases** covering all authentication scenarios.

## Test Coverage

### ✅ Valid Token Scenarios (4 tests)
- Allows requests with valid JWT token
- Correctly attaches user info to `req.user` object
- Handles tokens with or without "Bearer " prefix
- Verifies tokens with the correct secret key

### ✅ Missing Token Scenarios (4 tests)
- Rejects requests without Authorization header (401)
- Rejects requests with empty Authorization header (401)
- Rejects requests with "Bearer " but no token (401)
- Rejects requests with undefined Authorization header (401)

### ✅ Invalid Token Scenarios (4 tests)
- Rejects malformed JWT tokens (401)
- Rejects completely invalid token formats (401)
- Rejects tokens signed with wrong secret (401)
- Rejects tokens with tampered payloads (401)

### ✅ Expired Token Scenarios (2 tests)
- Rejects tokens that have expired (401)
- Rejects tokens with past expiration dates (401)
- Returns appropriate "Token expired." message

### ✅ Error Handling (3 tests)
- Handles unexpected errors gracefully (500)
- Includes error details in development mode
- Hides error details in production mode (security)

### ✅ Token Payload Verification (2 tests)
- Preserves all custom fields in `req.user`
- Includes token metadata (iat, exp) in `req.user`

### ✅ Integration with Express Routes (2 tests)
- Works correctly in Express middleware chain
- Prevents next middleware execution on auth failure

## Test Results
```
Test Suites: 1 passed
Tests:       21 passed
Time:        ~1.8s
```

## Key Testing Patterns

1. **Mock Objects**: Custom mock functions for `req`, `res`, and `next`
2. **JWT Generation**: Helper function `generateToken()` for creating valid test tokens
3. **Comprehensive Coverage**: Tests all success paths, error paths, and edge cases
4. **Security Testing**: Verifies proper error handling and information disclosure
5. **Environment Testing**: Tests both development and production error responses

## Test Categories

| Category | Tests | Focus |
|----------|-------|-------|
| Valid Tokens | 4 | Successful authentication flows |
| Missing Tokens | 4 | No token provided scenarios |
| Invalid Tokens | 4 | Malformed or tampered tokens |
| Expired Tokens | 2 | Token expiration handling |
| Error Handling | 3 | Unexpected errors & environments |
| Payload Verification | 2 | User data attachment |
| Integration | 2 | Middleware chain behavior |

## Security Validations

✅ **Authorization**: Only valid tokens grant access  
✅ **Token Verification**: Tokens must be signed with correct secret  
✅ **Expiration**: Expired tokens are rejected  
✅ **Tampering**: Modified tokens are detected and rejected  
✅ **Error Disclosure**: Sensitive info hidden in production  

## Running Tests

```bash
# Run middleware tests
npm test -- auth.middleware.test.js

# Run all backend tests
npm test

# Run tests in watch mode
npm test -- --watch auth.middleware.test.js

# Run with coverage
npm test -- --coverage auth.middleware.test.js
```

## Integration with Routes

The middleware is applied to protected routes:

```javascript
const auth = require('../middleware/auth');

router.get('/aggregate-by-country', auth, aggregateByCountry);
router.get('/', auth, getChingus);
```

All protected routes now require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```
