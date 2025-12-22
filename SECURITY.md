# Security Improvements Documentation

This document outlines the security improvements made to the Memesis application and provides guidance on deployment and configuration.

## Summary of Security Fixes

### Critical Issues Fixed ✅

1. **Environment Variable Loading** (`internal/infrastructure/database/postgres.go`)
   - Fixed `getEnv()` function to actually read from environment variables using `os.Getenv()`
   - Removed hardcoded database password from source code
   - Password now required via environment variable

2. **SSL/TLS for Database** (`internal/infrastructure/database/postgres.go`)
   - Changed default SSL mode from `disable` to `require`
   - Database connections now encrypted by default
   - Can be configured via `DB_SSLMODE` environment variable

3. **CORS Configuration** (`main.go:41-50`)
   - Added CORS middleware with restricted origins
   - Currently allows `http://localhost:5173` and `http://localhost:3000`
   - **Action Required**: Update allowed origins for production deployment

4. **Security Headers** (`internal/middleware/security.go`, `main.go:53`)
   - Added middleware for security headers:
     - `X-Frame-Options: DENY` - Prevents clickjacking
     - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
     - `X-XSS-Protection: 1; mode=block` - XSS protection
     - `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
     - `Content-Security-Policy` - Restrictive CSP for API

5. **Rate Limiting** (`internal/middleware/security.go`, `main.go:55-58`)
   - Implemented per-IP rate limiting using token bucket algorithm
   - Default: 10 requests/second per IP with burst of 20
   - Automatic cleanup every 5 minutes to prevent memory leaks

### High Severity Issues Fixed ✅

6. **Input Validation - Pagination** (`internal/handler/post_handler.go:47-51`)
   - Added maximum page limit (10,000) to prevent integer overflow
   - Prevents abuse via extremely large page numbers

7. **Input Validation - Post ID** (`internal/handler/post_handler.go:82-93, 105-119`)
   - Added length validation (max 100 characters)
   - Added format validation (alphanumeric, hyphens, underscores only)
   - Prevents injection attacks and abuse

8. **Frontend CSP Headers** (`web/index.html:7-17`)
   - Added Content Security Policy meta tags
   - Configured to allow scripts, styles, and images from safe sources
   - Prevents XSS attacks and malicious resource loading

### Medium Severity Issues Fixed ✅

9. **Request Timeouts** (`web/src/services/api.ts:14-27`)
   - Added 10-second timeout for all API requests
   - Uses AbortController for proper cancellation
   - Prevents indefinite hanging requests

10. **API Response Validation** (`web/src/utils/validation.ts`, `web/src/services/api.ts`)
    - Created validation utilities for all API responses
    - Validates data types and structure before use
    - Sanitizes and validates image URLs
    - Prevents malformed data from crashing the frontend

11. **Error Logging** (`web/src/services/api.ts:49-51, 76-78`)
    - Console errors only shown in development mode
    - Prevents information leakage in production builds

12. **Environment Configuration** (`docker-compose.yml`, `.env.example`)
    - Updated docker-compose.yml to use environment variables
    - Requires password to be set via .env file
    - Created .env.example with secure defaults

---

## Deployment Checklist

### Before Deploying to Production

- [ ] **Create .env file**
  ```bash
  cp .env.example .env
  ```

- [ ] **Generate secure database password**
  ```bash
  openssl rand -base64 32
  ```

- [ ] **Update .env file with secure values**
  - Set strong `DB_PASSWORD`
  - Set `DB_SSLMODE=require` or higher
  - Configure other environment variables as needed

- [ ] **Update CORS origins** (`main.go:42-43`)
  - Replace localhost URLs with your production domain(s)
  ```go
  AllowOrigins: []string{"https://yourdomain.com"},
  ```

- [ ] **Update CSP connect-src** (`web/index.html:13`)
  - Replace localhost with your production API domain
  ```html
  connect-src 'self' https://api.yourdomain.com;
  ```

- [ ] **Enable HSTS for HTTPS** (`internal/middleware/security.go:28`)
  - Uncomment the HSTS header line for production
  ```go
  c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  ```

- [ ] **Verify .env is in .gitignore**
  - Ensure `.env` file is never committed to version control

- [ ] **Set up database with SSL certificates**
  - For production databases, configure SSL certificates properly
  - Use `DB_SSLMODE=verify-full` with proper cert validation

---

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_USER` | `memesis_user` | Database username |
| `DB_PASSWORD` | *required* | Database password (no default) |
| `DB_NAME` | `memesis` | Database name |
| `DB_SSLMODE` | `require` | SSL mode (disable, require, verify-ca, verify-full) |

### Rate Limiting

Current configuration in `main.go:56`:
- **Rate**: 10 requests/second per IP
- **Burst**: 20 requests

To adjust, modify the `NewRateLimiter` parameters:
```go
rateLimiter := middleware.NewRateLimiter(rate.Limit(20), 40) // 20 RPS, burst of 40
```

### CORS Origins

Current configuration in `main.go:43`:
```go
AllowOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
```

For production, update to your actual domains:
```go
AllowOrigins: []string{
    "https://yourdomain.com",
    "https://www.yourdomain.com",
},
```

You can also make this configurable via environment variables:
```go
AllowOrigins: strings.Split(os.Getenv("CORS_ORIGINS"), ","),
```

---

## Testing Security Features

### Test Rate Limiting
```bash
# Send rapid requests to trigger rate limiting
for i in {1..30}; do
  curl http://localhost:8080/posts
  sleep 0.05
done
```

### Test Input Validation
```bash
# Test page overflow
curl "http://localhost:8080/posts?page=999999999"

# Test invalid post ID
curl "http://localhost:8080/posts/invalid<script>alert(1)</script>"

# Test long post ID
curl "http://localhost:8080/posts/$(python3 -c 'print("a"*200)')"
```

### Verify Security Headers
```bash
curl -I http://localhost:8080/posts
```

Expected headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Remaining Security Considerations

### Authentication & Authorization ⚠️
**Status**: Not implemented

The application currently has no authentication or authorization layer. All endpoints are public.

**Recommendations**:
- Implement JWT-based authentication
- Add user roles and permissions
- Protect Create/Update/Delete operations
- Add authentication middleware to protected routes

**Example implementation** (not included in current fixes):
```go
// Add JWT middleware
authMiddleware := middleware.JWTAuth(jwtSecret)
authorized := r.Group("/")
authorized.Use(authMiddleware)
{
    authorized.POST("/posts", postHandler.CreatePost)
    authorized.PUT("/posts/:id", postHandler.UpdatePost)
    authorized.DELETE("/posts/:id", postHandler.DeletePost)
}
```

### Additional Recommendations

1. **Structured Logging**
   - Replace `fmt.Println` with structured logging (e.g., zerolog, zap)
   - Include request IDs for tracing
   - Log security events (rate limit violations, validation failures)

2. **Database Connection Security**
   - Use connection string encryption
   - Rotate database credentials regularly
   - Use read-only database users where appropriate

3. **Dependency Scanning**
   - Set up automated security scanning (e.g., Dependabot, Snyk)
   - Regularly update dependencies
   - Monitor for CVEs

4. **Input Sanitization**
   - Consider adding HTML sanitization for user-generated content
   - Validate all input at API boundaries

5. **Monitoring & Alerting**
   - Monitor rate limit violations
   - Track failed authentication attempts (once auth is added)
   - Alert on suspicious activity patterns

6. **HTTPS Only**
   - Use HTTPS in production
   - Enable HSTS headers
   - Implement certificate pinning if needed

---

## Files Modified

### Backend
- `internal/infrastructure/database/postgres.go` - Environment variables, SSL
- `internal/middleware/security.go` - New file with security middleware
- `internal/handler/post_handler.go` - Input validation
- `main.go` - Added CORS, security headers, rate limiting
- `go.mod` - Added dependencies (cors, rate limiter)
- `docker-compose.yml` - Environment variable support
- `.env.example` - New file with configuration template

### Frontend
- `web/index.html` - CSP and security meta tags
- `web/src/services/api.ts` - Timeouts and validation
- `web/src/utils/validation.ts` - New file with validation utilities

### Documentation
- `SECURITY.md` - This file (new)

---

## Support & Questions

For security concerns or questions about these implementations:
1. Review the inline code comments
2. Check this documentation
3. Refer to OWASP security guidelines
4. Test thoroughly in a staging environment before production deployment

## Security Updates

Last updated: 2025-12-22
Security fixes applied: 12 issues resolved
