---
name: auth-patterns
description: >
  Complete guide for implementing authentication and authorization in modern applications.
  Covers JWT, OAuth2, OIDC, session management, RBAC/ABAC, MFA, social login,
  password hashing, and security best practices for auth flows.
version: 1.0.0
trigger_keywords:
  - auth
  - login
  - JWT
  - OAuth
  - session
  - permission
  - RBAC
  - ABAC
  - token
  - password
  - MFA
  - 2FA
  - OIDC
  - SSO
  - social login
  - API key
---

# Authentication & Authorization Patterns

## 1. Authentication Methods Overview

| Method | Stateless | Best For | Complexity |
|--------|-----------|----------|------------|
| **JWT (JSON Web Tokens)** | Yes | SPAs, mobile apps, microservices | Medium |
| **Session-based** | No (server state) | Traditional web apps, SSR | Low |
| **OAuth 2.0 / OIDC** | Depends | Third-party login, delegated auth | High |
| **API Keys** | Yes | Server-to-server, public APIs | Low |
| **mTLS (Mutual TLS)** | Yes | Service mesh, zero-trust infra | High |
| **Passkeys / WebAuthn** | Yes | Passwordless modern apps | Medium |

---

## 2. JWT (JSON Web Tokens)

### 2.1 Token Structure

```
Header.Payload.Signature

{                              {                              HMACSHA256(
  "alg": "RS256",                "sub": "user-123",             base64(header) + "." +
  "typ": "JWT"                   "email": "a@b.com",            base64(payload),
}                                "role": "admin",               secret
                                 "iat": 1700000000,           )
                                 "exp": 1700003600
                               }
```

### 2.2 JWT Best Practices

| Practice | Details |
|----------|---------|
| **Use RS256 over HS256** | Asymmetric keys — the verifier doesn't need the signing secret |
| **Short expiry for access tokens** | 15 minutes or less |
| **Use refresh tokens** | Long-lived (7–30 days), stored securely, rotated on use |
| **Never store sensitive data in payload** | JWTs are base64-encoded, not encrypted |
| **Include only necessary claims** | `sub`, `role`, `exp`, `iat`, `jti` — avoid bloated tokens |
| **Use `jti` (JWT ID)** | Enables token revocation via a blocklist |
| **Validate `iss`, `aud`, `exp`** | Always verify issuer, audience, and expiry server-side |

### 2.3 Token Rotation Flow

```
1. Client authenticates → receives access_token + refresh_token
2. Access token expires (15 min)
3. Client sends refresh_token to /auth/refresh
4. Server validates refresh_token:
   a. Check not revoked (DB/Redis lookup)
   b. Check not expired
   c. Issue NEW access_token + NEW refresh_token
   d. Revoke the OLD refresh_token (one-time use)
5. If refresh_token is reused → revoke ALL tokens for user (breach detected)
```

### 2.4 Token Storage

| Storage | XSS Safe | CSRF Safe | Recommended |
|---------|----------|-----------|-------------|
| **HttpOnly cookie** | ✅ | ❌ (needs CSRF token) | ✅ Best for web apps |
| **localStorage** | ❌ | ✅ | ❌ Avoid |
| **sessionStorage** | ❌ | ✅ | ❌ Avoid |
| **In-memory (JS variable)** | ✅ | ✅ | ✅ Good for SPAs (lost on refresh) |
| **HttpOnly cookie + in-memory** | ✅ | ✅ | ✅ Best hybrid approach |

---

## 3. Session-Based Authentication

### 3.1 Flow

```
1. User POSTs credentials to /login
2. Server validates, creates session in store (Redis/DB)
3. Server sets session ID in HttpOnly, Secure, SameSite cookie
4. Subsequent requests include cookie automatically
5. Server looks up session by ID on each request
6. Logout: delete session from store + clear cookie
```

### 3.2 Session Storage Options

| Store | Pros | Cons |
|-------|------|------|
| **Redis** | Fast, TTL support, shared across instances | Requires Redis infrastructure |
| **Database** | Durable, queryable | Slower, needs cleanup job |
| **In-memory** | Simplest | Lost on restart, can't scale horizontally |
| **Encrypted cookie** | No server state | Size limited, can't revoke server-side |

### 3.3 Session Configuration

```javascript
// Express.js example with express-session + Redis
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: '__session',  // Don't use default 'connect.sid'
  cookie: {
    httpOnly: true,
    secure: true,        // HTTPS only
    sameSite: 'lax',     // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    domain: '.example.com',
  },
}));
```

---

## 4. OAuth 2.0 & OpenID Connect

### 4.1 OAuth 2.0 Grant Types

| Grant Type | Use Case | Security Level |
|------------|----------|----------------|
| **Authorization Code + PKCE** | SPAs, mobile apps, server apps | ✅ Highest |
| **Authorization Code** (no PKCE) | Server-side web apps (legacy) | ✅ High |
| **Client Credentials** | Machine-to-machine | ✅ High |
| **Device Code** | Smart TVs, CLI tools | Medium |
| **Implicit** (deprecated) | Legacy SPAs | ❌ Deprecated — use Auth Code + PKCE |
| **Resource Owner Password** (deprecated) | Legacy first-party apps | ❌ Deprecated |

### 4.2 Authorization Code + PKCE Flow

```
1. Client generates code_verifier (random string) + code_challenge (SHA256 hash)
2. Client redirects to authorization server:
   GET /authorize?response_type=code&client_id=...&redirect_uri=...
       &scope=openid profile email&state=RANDOM&code_challenge=...
       &code_challenge_method=S256
3. User authenticates and consents
4. Auth server redirects back with authorization code:
   GET /callback?code=AUTH_CODE&state=RANDOM
5. Client exchanges code for tokens (server-side):
   POST /token { grant_type=authorization_code, code=AUTH_CODE,
                 redirect_uri=..., code_verifier=ORIGINAL_VERIFIER }
6. Auth server returns: { access_token, refresh_token, id_token }
```

### 4.3 OIDC vs OAuth 2.0

| Feature | OAuth 2.0 | OIDC (OAuth 2.0 + Identity Layer) |
|---------|-----------|-----------------------------------|
| Purpose | Authorization (access) | Authentication (identity) + Authorization |
| Token | `access_token` | `access_token` + `id_token` |
| User info | No standard | `/userinfo` endpoint, `id_token` claims |
| Scope | Custom | `openid`, `profile`, `email` |

---

## 5. Authorization Models

### 5.1 RBAC (Role-Based Access Control)

```
User → has Roles → Roles have Permissions

Example:
  User "alice" → Role "editor" → Permissions ["posts:read", "posts:write", "posts:delete"]
  User "bob"   → Role "viewer" → Permissions ["posts:read"]
```

**Database schema:**

```sql
CREATE TABLE roles (
    id    UUID PRIMARY KEY,
    name  VARCHAR(50) UNIQUE NOT NULL  -- 'admin', 'editor', 'viewer'
);

CREATE TABLE permissions (
    id       UUID PRIMARY KEY,
    action   VARCHAR(50) NOT NULL,      -- 'read', 'write', 'delete'
    resource VARCHAR(100) NOT NULL      -- 'posts', 'users', 'settings'
);

CREATE TABLE role_permissions (
    role_id       UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
```

### 5.2 ABAC (Attribute-Based Access Control)

```
Policy: ALLOW if (user.department == resource.department AND user.clearance >= resource.classification)

Attributes:
  - Subject: user role, department, clearance level
  - Resource: type, owner, classification
  - Action: read, write, delete
  - Environment: time of day, IP address, device
```

**When to use ABAC over RBAC:**
- Fine-grained, context-dependent decisions
- Dynamic policies that change without code deploys
- Multi-tenant systems with per-tenant rules
- Regulatory compliance (HIPAA, GDPR data access controls)

### 5.3 Permission Check Implementation

```typescript
// Middleware pattern
function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const hasPermission = await checkPermission(user.id, resource, action);
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You do not have ${action} access to ${resource}`,
      });
    }
    next();
  };
}

// Usage
app.delete('/api/posts/:id', 
  authenticate,
  requirePermission('posts', 'delete'),
  deletePostHandler
);
```

---

## 6. Multi-Factor Authentication (MFA)

### 6.1 MFA Methods

| Method | Security | UX | Implementation |
|--------|----------|-----|----------------|
| **TOTP (Authenticator app)** | High | Good | `otplib`, `pyotp` |
| **SMS OTP** | Medium (SIM swap risk) | Easy | Twilio, AWS SNS |
| **Email OTP** | Medium | Easy | Any email service |
| **WebAuthn / Passkeys** | Very High | Excellent | `@simplewebauthn/server` |
| **Hardware keys (FIDO2)** | Very High | Moderate | YubiKey, Titan |
| **Push notification** | High | Excellent | Custom or Duo |

### 6.2 TOTP Implementation

```typescript
import { authenticator } from 'otplib';

// 1. Generate secret for user during MFA setup
const secret = authenticator.generateSecret();
// Store encrypted: user.mfa_secret = encrypt(secret)

// 2. Generate QR code URI
const otpauthUrl = authenticator.keyuri(user.email, 'MyApp', secret);
// Convert to QR code image using 'qrcode' library

// 3. Verify token during login
const isValid = authenticator.verify({ token: userInput, secret: decryptedSecret });

// 4. Generate backup codes (one-time use)
const backupCodes = Array.from({ length: 10 }, () =>
  crypto.randomBytes(4).toString('hex')  // e.g., "a1b2c3d4"
);
// Store hashed: hash each backup code with bcrypt
```

### 6.3 MFA Enrollment Flow

```
1. User enables MFA in settings
2. Server generates TOTP secret, returns QR code
3. User scans QR with authenticator app
4. User enters current TOTP code to verify setup
5. Server generates 10 backup codes, displays ONCE
6. User stores backup codes securely
7. MFA is now required on all future logins
```

---

## 7. Password Security

### 7.1 Hashing Algorithms

| Algorithm | Recommended | Notes |
|-----------|-------------|-------|
| **Argon2id** | ✅ Best | Winner of Password Hashing Competition, memory-hard |
| **bcrypt** | ✅ Good | Widely supported, proven, work factor adjustable |
| **scrypt** | ✅ Good | Memory-hard, less common than Argon2 |
| **PBKDF2** | ⚠️ Acceptable | NIST approved, but weaker than Argon2/bcrypt |
| **SHA-256/512** | ❌ Never | Not designed for passwords |
| **MD5** | ❌ Never | Broken, trivially reversible |

### 7.2 Configuration

```typescript
// bcrypt
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;  // Adjust: aim for ~250ms hash time
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const isMatch = await bcrypt.compare(password, hash);

// Argon2id
import argon2 from 'argon2';
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,   // 64 MB
  timeCost: 3,          // 3 iterations
  parallelism: 4,       // 4 threads
});
const isMatch = await argon2.verify(hash, password);
```

### 7.3 Password Policy

| Rule | Recommendation |
|------|----------------|
| **Minimum length** | 8 characters (NIST 800-63B: no max, allow up to 64+) |
| **Complexity rules** | ❌ Don't require uppercase/special chars (NIST guidance) |
| **Breached password check** | ✅ Check against HaveIBeenPwned API (k-anonymity model) |
| **Password rotation** | ❌ Don't force periodic changes (NIST guidance) |
| **Paste in password fields** | ✅ Allow (enables password manager use) |
| **Show/hide toggle** | ✅ Include for usability |

---

## 8. Social Login Integration

### 8.1 Provider Setup

| Provider | OAuth Endpoint | Scopes | Notes |
|----------|---------------|--------|-------|
| **Google** | `accounts.google.com` | `openid profile email` | OIDC compliant |
| **GitHub** | `github.com/login/oauth` | `user:email` | OAuth 2.0 only |
| **Apple** | `appleid.apple.com` | `name email` | Requires JWT client_secret |
| **Microsoft** | `login.microsoftonline.com` | `openid profile email` | OIDC compliant |
| **Facebook** | `facebook.com/v18.0/dialog/oauth` | `email public_profile` | OAuth 2.0 |

### 8.2 Account Linking Strategy

```
On social login callback:
1. Extract email from provider response
2. Check: does a user with this email already exist?
   a. YES + same provider linked → Log in
   b. YES + different provider → Link accounts (after email verification)
   c. YES + password account → Prompt to link or reject
   d. NO → Create new user account, link provider
3. Store provider info:
   - provider_name (google, github, etc.)
   - provider_user_id (unique per provider)
   - access_token (encrypted, if needed for API calls)
```

### 8.3 Database Schema for Social Login

```sql
CREATE TABLE user_identities (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,   -- 'google', 'github', 'apple'
    provider_id     VARCHAR(255) NOT NULL,  -- Provider's user ID
    email           VARCHAR(255),
    access_token    TEXT,                    -- Encrypted
    refresh_token   TEXT,                    -- Encrypted
    token_expires   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_id)
);
```

---

## 9. API Key Authentication

### 9.1 API Key Design

```
Format: prefix_environment_randomBytes
Example: myapp_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

Rules:
- Generate with crypto-secure random: crypto.randomBytes(32).toString('hex')
- Store HASHED in database (SHA-256 is fine for API keys, unlike passwords)
- Show full key only ONCE at creation time
- Include a recognizable prefix for identification
- Support key rotation (multiple active keys per user)
```

### 9.2 API Key Security

| Practice | Details |
|----------|---------|
| **Hash before storing** | `SHA-256(key)` — never store plaintext |
| **Rate limit per key** | Prevent abuse; 100–1000 req/min typical |
| **Scope/permission per key** | Read-only vs read-write keys |
| **Expiration date** | Optional but recommended, force rotation |
| **IP allowlist** | Optional, restrict to known server IPs |
| **Audit logging** | Log every API key usage with timestamp + IP |
| **Revocation** | Instant revocation, takes effect immediately |

---

## 10. Security Checklist for Auth Flows

### 10.1 CSRF Prevention

| Context | Protection |
|---------|------------|
| **Session cookies** | `SameSite=Lax` or `Strict` + CSRF token |
| **JWT in cookie** | `SameSite=Lax` + CSRF token in header |
| **JWT in header** | Not vulnerable (browser doesn't auto-send) |
| **OAuth state param** | Always use `state` parameter with CSRF token |

### 10.2 XSS Prevention in Auth

| Rule | Details |
|------|---------|
| **HttpOnly cookies** | JS cannot access auth cookies |
| **CSP headers** | `Content-Security-Policy: script-src 'self'` |
| **Sanitize all output** | HTML-encode user data before rendering |
| **No tokens in URLs** | Never put tokens in query strings (logged, cached, leaked in Referer) |
| **Subresource Integrity** | `<script integrity="sha384-...">` for CDN scripts |

### 10.3 Brute Force Protection

```typescript
// Rate limiting login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per window
  keyGenerator: (req) => req.body.email,  // Per-account limiting
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
  },
});

// Account lockout after N failures
// 1. Track failed attempts in DB/Redis
// 2. Lock account after 10 failures
// 3. Require email verification or admin unlock
// 4. Implement progressive delays: 1s, 2s, 4s, 8s...
```

### 10.4 Comprehensive Auth Security Checklist

| Category | Item | Status |
|----------|------|--------|
| **Transport** | All auth endpoints over HTTPS | ☐ |
| **Transport** | HSTS header enabled | ☐ |
| **Passwords** | Argon2id or bcrypt hashing | ☐ |
| **Passwords** | Breached password check (HIBP) | ☐ |
| **Tokens** | Short-lived access tokens (≤15 min) | ☐ |
| **Tokens** | Refresh token rotation (one-time use) | ☐ |
| **Tokens** | Secure token storage (HttpOnly cookies) | ☐ |
| **Sessions** | Regenerate session ID after login | ☐ |
| **Sessions** | Clear session on logout (server + client) | ☐ |
| **CSRF** | SameSite cookie attribute set | ☐ |
| **CSRF** | CSRF token for state-changing operations | ☐ |
| **XSS** | CSP headers configured | ☐ |
| **XSS** | No tokens in localStorage | ☐ |
| **Brute force** | Rate limiting on login endpoint | ☐ |
| **Brute force** | Account lockout policy | ☐ |
| **OAuth** | `state` parameter for CSRF | ☐ |
| **OAuth** | PKCE for public clients | ☐ |
| **Logging** | Log auth events (login, failure, MFA) | ☐ |
| **Logging** | Never log passwords or tokens | ☐ |
| **MFA** | Offer TOTP or WebAuthn | ☐ |
| **MFA** | Backup codes generated and stored hashed | ☐ |

---

## 11. Session Management Best Practices

### 11.1 Session Lifecycle

```
CREATE  → On successful authentication
EXTEND  → On each authenticated request (sliding expiry)
REFRESH → When approaching expiry (optional)
REVOKE  → On logout, password change, or security event
EXPIRE  → After max idle time (30 min) or absolute time (24 hrs)
CLEANUP → Scheduled job to purge expired sessions
```

### 11.2 Session Invalidation Triggers

| Event | Action |
|-------|--------|
| User logs out | Delete session |
| Password changed | Invalidate ALL sessions for user |
| Email changed | Invalidate ALL sessions for user |
| MFA enabled/disabled | Invalidate ALL other sessions |
| Account compromised | Invalidate ALL sessions + force password reset |
| Role/permission changed | Invalidate ALL sessions (force re-auth) |
| Suspicious activity | Invalidate session + notify user |

### 11.3 "Remember Me" Implementation

```
Without "Remember Me":
  - Session cookie (no Max-Age) → expires when browser closes

With "Remember Me":
  - Persistent cookie (Max-Age: 30 days)
  - Store a separate "remember token" (not the session ID)
  - On return visit: validate remember token → create new session
  - Remember token is one-time use (rotate on each use)
  - Allow user to view/revoke active "remembered" devices
```
