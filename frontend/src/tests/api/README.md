# Axios Interceptor - Test Coverage Summary

## Overview
Comprehensive test suite for the axios request interceptor with **25 test cases** covering all authentication token attachment scenarios.

## Test Coverage

### ✅ Axios Instance Configuration (2 tests)
- Creates axios instance with correct baseURL from environment variable
- Registers request interceptor on initialization

### ✅ Request Interceptor - Authorization Header (6 tests)
- Attaches `Authorization: Bearer <token>` header when backend token is present
- Attaches header with proper Bearer prefix format
- Does NOT add header when session is null (unauthenticated)
- Does NOT add header when session exists but has no backendToken (Google auth without backend token)
- Does NOT add header when backendToken is empty string
- Does NOT add header when backendToken is undefined

### ✅ Request Interceptor - Multiple Request Types (4 tests)
- Attaches token to GET requests
- Attaches token to POST requests
- Attaches token to PUT requests
- Attaches token to DELETE requests

### ✅ Request Interceptor - Error Handling (4 tests)
- Handles getSession() errors gracefully (propagates error)
- Handles getSession() returning undefined
- Handles malformed session objects without crashing
- Propagates interceptor errors correctly

### ✅ Request Interceptor - Preserving Existing Configuration (3 tests)
- Preserves existing headers when adding Authorization header
- Overrides existing Authorization header with session token
- Preserves request data and params during interception

### ✅ Real-world Scenarios (5 tests)
- Handles authenticated user making API call (email/password login)
- Handles unauthenticated user making API call
- Handles Google OAuth user with backend token
- Handles Google OAuth user without backend token
- Handles rapid consecutive requests correctly

### ✅ Interceptor Integration (1 test)
- Verifies interceptor is registered and called for every request

## Test Results
```
Test Suites: 1 passed
Tests:       25 passed
Time:        ~1.7s
```

## Key Testing Patterns

1. **Mock Setup**: Properly mocks `axios.create()` and `getSession()` before module import
2. **Interceptor Access**: Captures interceptor functions during registration
3. **Comprehensive Coverage**: Tests all token scenarios, HTTP methods, and edge cases
4. **Real Scenarios**: Tests actual use cases (email login, Google OAuth, unauthenticated)

## Interceptor Behavior

### When Token is Present:
```javascript
config.headers.Authorization = `Bearer ${session.backendToken}`;
```

### When Token is Missing:
- No Authorization header is added
- Request proceeds normally
- No errors are thrown

## Test Categories

| Category | Tests | Focus |
|----------|-------|-------|
| Configuration | 2 | Instance setup & interceptor registration |
| Authorization Header | 6 | Token attachment logic |
| HTTP Methods | 4 | GET, POST, PUT, DELETE requests |
| Error Handling | 4 | Session errors & malformed data |
| Configuration Preservation | 3 | Headers, data, params |
| Real-world Scenarios | 5 | Actual authentication flows |
| Integration | 1 | Interceptor lifecycle |

## Security Validations

✅ **Token Attachment**: Only attaches token when available  
✅ **No Token Leakage**: Doesn't add Authorization header when unauthenticated  
✅ **Error Resilience**: Handles session retrieval failures gracefully  
✅ **Universal Application**: Works for all HTTP methods  

## Running Tests

```bash
# Run axios interceptor tests
npm test -- axiosInstance.test.js

# Run all frontend tests
npm test

# Run tests in watch mode
npm test -- --watch axiosInstance.test.js

# Run with coverage
npm test -- --coverage axiosInstance.test.js
```

## Integration with Backend

The interceptor automatically attaches JWT tokens from NextAuth session to all API requests:

```javascript
// Frontend (automatic via interceptor)
const response = await api.get('/api/chingus');

// Backend receives
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No manual token handling required in application code!
