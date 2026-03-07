# Security Setup Guide

This guide covers the security configuration for the AI FutureLinks Platform, including encryption, authentication, and secure credential management.

## Overview

The platform implements multiple layers of security:

1. **API Key Encryption**: All API keys stored in the database are encrypted using AES-256-GCM
2. **Password Hashing**: Admin passwords are hashed using bcrypt with 12 salt rounds
3. **Session Security**: NextAuth.js provides secure JWT-based session management
4. **HTTPS Enforcement**: All traffic is encrypted in transit
5. **Secure Headers**: CSP, X-Frame-Options, and other security headers protect against common attacks

## Encryption Key Setup

### What is the ENCRYPTION_KEY?

The `ENCRYPTION_KEY` is a 32-byte (256-bit) secret key used for AES-256-GCM encryption of API keys stored in the database. This ensures that even if someone gains access to your database, they cannot read the API keys without this encryption key.

### Generating the Encryption Key

**Method 1: Using the provided script (recommended)**
```bash
npm run env:generate
```

This will generate both `ENCRYPTION_KEY` and `NEXTAUTH_SECRET` with proper formatting.

**Method 2: Using Node.js directly**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 3: Using OpenSSL**
```bash
openssl rand -hex 32
```

### Requirements

- Must be exactly 64 hexadecimal characters (32 bytes when decoded)
- Must be kept secret and never committed to version control
- Should be different for each environment (dev, staging, production)

### Example

```env
ENCRYPTION_KEY="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
```

### Critical Warning

⚠️ **If you lose the ENCRYPTION_KEY, you will NOT be able to decrypt existing API keys in the database!**

- Back up this key securely
- Store it in a password manager or secrets vault
- Never commit it to version control
- Consider using a key management service (AWS KMS, Google Cloud KMS) for production

## NextAuth Secret Setup

### What is NEXTAUTH_SECRET?

The `NEXTAUTH_SECRET` is used by NextAuth.js to sign and encrypt JWT tokens, cookies, and session data. It ensures that session tokens cannot be forged or tampered with.

### Generating the NextAuth Secret

**Method 1: Using the provided script (recommended)**
```bash
npm run env:generate
```

**Method 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Using OpenSSL**
```bash
openssl rand -base64 32
```

### Requirements

- Should be at least 32 characters long
- Should be a random, unpredictable string
- Must be kept secret
- Should be different for each environment

### Example

```env
NEXTAUTH_SECRET="Xj8K9mN2pQ5rS7tU1vW3xY6zA8bC0dE4fG7hI9jK2lM5nO8pQ1rS4tU7vW0xY3z"
```

## Google OAuth Setup

### Creating OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Create a new project or select an existing one
   - Name it something like "AI FutureLinks"

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Search for "Google People API" and enable it

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: "AI FutureLinks"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode

5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "AI FutureLinks Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://ai.futurelinks.art` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local)
     - `https://ai.futurelinks.art/api/auth/callback/google` (for production)

6. **Copy Your Credentials**
   - Copy the Client ID (looks like: `your-project-id.apps.googleusercontent.com`)
   - Copy the Client Secret (looks like: `GOCSPX-...`)

### Adding to Environment Variables

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Testing OAuth

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Click the Google sign-in button
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you should be redirected back to your app

### Common Issues

**"redirect_uri_mismatch" error:**
- Ensure the redirect URI in Google Cloud Console exactly matches
- No trailing slashes
- Check for http vs https
- Verify the port number (3000 for local dev)

**"Access blocked: This app's request is invalid":**
- Make sure you've configured the OAuth consent screen
- Add your email as a test user if the app is in testing mode

## Initial Admin Credentials

### Setting Up the First Admin

The `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` are used to create the first admin account when you run the database seed script.

```env
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="TempPassword123!"
```

### Requirements

- Username: Any non-empty string
- Password: At least 8 characters

### Security Best Practices

1. **Change the password immediately after first login**
   - The initial password is stored in your `.env.local` file
   - Anyone with access to this file can see it
   - Change it through the admin dashboard after logging in

2. **Use a strong password**
   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Don't use common words or patterns

3. **Don't reuse passwords**
   - Use a unique password for the admin account
   - Consider using a password manager

## Environment-Specific Security

### Development Environment

For local development, security can be slightly relaxed:

```env
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="<generated-key>"
NEXTAUTH_SECRET="<generated-secret>"
```

- HTTP is acceptable for localhost
- Use generated keys, but they don't need to be as strong as production

### Production Environment

For production, security must be maximized:

```env
NEXTAUTH_URL="https://ai.futurelinks.art"
ENCRYPTION_KEY="<strong-generated-key>"
NEXTAUTH_SECRET="<strong-generated-secret>"
```

- HTTPS is required
- Use strong, randomly generated keys
- Store keys in Vercel's encrypted environment variables
- Enable all security headers
- Use different keys than development

## Security Headers

The platform implements the following security headers (configured in `middleware.ts`):

### Content Security Policy (CSP)
Prevents XSS attacks by controlling which resources can be loaded.

### X-Frame-Options
Prevents clickjacking by controlling whether the site can be embedded in iframes.

### X-Content-Type-Options
Prevents MIME type sniffing attacks.

### Strict-Transport-Security (HSTS)
Forces browsers to use HTTPS for all requests.

### X-XSS-Protection
Enables browser XSS filtering (legacy browsers).

## Session Security

### Session Configuration

NextAuth.js is configured with secure session settings:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 60, // 30 minutes for admin sessions
}
```

### Session Cookies

Cookies are configured with secure flags:
- `httpOnly: true` - Prevents JavaScript access
- `secure: true` - Only sent over HTTPS (production)
- `sameSite: 'lax'` - CSRF protection

### Admin Session Timeout

Admin sessions automatically expire after 30 minutes of inactivity for security.

## Encryption Implementation

### AES-256-GCM

The platform uses AES-256-GCM for API key encryption:

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes, randomly generated per encryption)
- **Authentication**: Built-in authentication tag prevents tampering

### Encryption Process

1. Generate random 16-byte IV (Initialization Vector)
2. Create cipher with AES-256-GCM algorithm
3. Encrypt plaintext API key
4. Get authentication tag
5. Store: `IV:EncryptedData:AuthTag` (all hex-encoded)

### Decryption Process

1. Split stored value into IV, encrypted data, and auth tag
2. Create decipher with AES-256-GCM algorithm
3. Set authentication tag
4. Decrypt and verify authenticity
5. Return plaintext API key

## Password Hashing

### Bcrypt Configuration

Admin passwords are hashed using bcrypt:

- **Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Library**: `bcryptjs` (pure JavaScript implementation)

### Why Bcrypt?

- Designed for password hashing
- Adaptive: can increase rounds as computers get faster
- Includes salt automatically
- Resistant to rainbow table attacks
- Slow by design (prevents brute force)

## Security Checklist

Before deploying to production:

- [ ] Generated strong ENCRYPTION_KEY (32 bytes hex)
- [ ] Generated strong NEXTAUTH_SECRET (32+ characters)
- [ ] Configured Google OAuth with production redirect URIs
- [ ] Set NEXTAUTH_URL to production domain (HTTPS)
- [ ] Changed initial admin password
- [ ] Verified all environment variables are set in Vercel
- [ ] Enabled HTTPS enforcement
- [ ] Tested authentication flow
- [ ] Verified API key encryption/decryption works
- [ ] Checked security headers are present
- [ ] Reviewed admin session timeout behavior
- [ ] Backed up ENCRYPTION_KEY securely

## Monitoring and Auditing

### What to Monitor

1. **Failed Login Attempts**
   - Multiple failed admin logins may indicate brute force attack
   - Set up alerts for unusual patterns

2. **API Key Usage**
   - Monitor for unexpected API key usage
   - Alert on rate limit violations

3. **Session Anomalies**
   - Multiple concurrent admin sessions
   - Sessions from unusual locations

4. **Database Access**
   - Monitor for direct database access attempts
   - Alert on unauthorized connection attempts

### Logging

The platform logs security-relevant events:
- Authentication attempts (success and failure)
- Admin actions (API key creation, modification, deletion)
- Session creation and termination
- Encryption/decryption operations (errors only)

## Incident Response

If you suspect a security breach:

1. **Immediately rotate all secrets:**
   - Generate new ENCRYPTION_KEY
   - Generate new NEXTAUTH_SECRET
   - Rotate all API keys stored in the platform

2. **Invalidate all sessions:**
   - Change NEXTAUTH_SECRET to invalidate all JWT tokens
   - Force all users to re-authenticate

3. **Audit database access:**
   - Check database logs for unauthorized access
   - Review recent changes to API keys and admin accounts

4. **Re-encrypt API keys:**
   - If ENCRYPTION_KEY was compromised, decrypt all API keys with old key
   - Re-encrypt with new key
   - Update ENCRYPTION_KEY in environment variables

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
