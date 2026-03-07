# Environment Variables Setup Guide

This guide walks you through configuring all required environment variables for the AI FutureLinks Platform.

## Quick Start

1. **Copy the template file:**
   ```bash
   cp .env.local.template .env.local
   ```

2. **Generate secure keys:**
   ```bash
   node scripts/generate-keys.js
   ```

3. **Copy the generated keys into `.env.local`**

4. **Set up Google OAuth (see below)**

5. **Configure your database connection**

## Required Environment Variables

### 1. Database Configuration

#### `DATABASE_URL`
Connection pooling URL used by Prisma Client in serverless environments.

**Local Development:**
```env
DATABASE_URL="postgres://user:password@localhost:5432/ai_futurelinks?sslmode=require&pgbouncer=true&connect_timeout=15"
```

**Vercel Production:**
This will be automatically set by Vercel when you connect a Postgres database.

#### `DIRECT_URL`
Direct connection URL used for database migrations.

**Local Development:**
```env
DIRECT_URL="postgres://user:password@localhost:5432/ai_futurelinks?sslmode=require"
```

**Vercel Production:**
This will be automatically set by Vercel.

### 2. Security & Encryption

#### `ENCRYPTION_KEY`
A 32-byte hexadecimal string used for AES-256-GCM encryption of API keys stored in the database.

**Requirements:**
- Must be exactly 64 hexadecimal characters (32 bytes)
- Must be kept secret and never shared
- Should be different for each environment (dev, staging, production)

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```env
ENCRYPTION_KEY="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
```

⚠️ **CRITICAL:** If you lose this key, you will not be able to decrypt existing API keys in the database!

### 3. NextAuth Configuration

#### `NEXTAUTH_URL`
The canonical URL of your application.

**Local Development:**
```env
NEXTAUTH_URL="http://localhost:3000"
```

**Production:**
```env
NEXTAUTH_URL="https://ai.futurelinks.art"
```

#### `NEXTAUTH_SECRET`
Secret key used by NextAuth.js for signing and encrypting tokens, cookies, and sessions.

**Requirements:**
- Should be a random string of at least 32 characters
- Must be kept secret
- Should be different for each environment

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or using OpenSSL:
```bash
openssl rand -base64 32
```

**Example:**
```env
NEXTAUTH_SECRET="Xj8K9mN2pQ5rS7tU1vW3xY6zA8bC0dE4fG7hI9jK2lM5nO8pQ1rS4tU7vW0xY3z"
```

### 4. Google OAuth Credentials

#### Setting Up Google OAuth

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project:**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - For local: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://ai.futurelinks.art/api/auth/callback/google`

5. **Copy Your Credentials:**
   - Copy the Client ID and Client Secret

#### `GOOGLE_CLIENT_ID`
Your Google OAuth 2.0 Client ID.

**Example:**
```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

#### `GOOGLE_CLIENT_SECRET`
Your Google OAuth 2.0 Client Secret.

**Example:**
```env
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Email Provider (Optional)

If you want to enable email-based authentication (magic links), configure these variables.

#### `EMAIL_SERVER`
SMTP server connection string.

**Format:**
```env
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
```

**Examples:**

**Gmail:**
```env
EMAIL_SERVER="smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587"
```

**SendGrid:**
```env
EMAIL_SERVER="smtp://apikey:your-sendgrid-api-key@smtp.sendgrid.net:587"
```

**Mailgun:**
```env
EMAIL_SERVER="smtp://postmaster@your-domain.mailgun.org:your-password@smtp.mailgun.org:587"
```

#### `EMAIL_FROM`
The "from" address for authentication emails.

**Example:**
```env
EMAIL_FROM="noreply@futurelinks.art"
```

### 6. Initial Admin Credentials

These credentials are used to create the first admin account when you run the database seed script.

#### `INITIAL_ADMIN_USERNAME`
Username for the initial admin account.

**Example:**
```env
INITIAL_ADMIN_USERNAME="admin"
```

#### `INITIAL_ADMIN_PASSWORD`
Password for the initial admin account.

**Requirements:**
- Must be at least 8 characters
- Should be changed immediately after first login

**Example:**
```env
INITIAL_ADMIN_PASSWORD="TempPassword123!"
```

⚠️ **IMPORTANT:** Change this password immediately after your first login to the admin dashboard!

## Environment-Specific Configuration

### Local Development

Create `.env.local` with:
- Local database connection
- Generated ENCRYPTION_KEY
- Generated NEXTAUTH_SECRET
- Google OAuth credentials (with localhost redirect)
- `NEXTAUTH_URL="http://localhost:3000"`

### Vercel Production

Set environment variables in Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables
4. `DATABASE_URL` and `DIRECT_URL` will be auto-populated when you connect Vercel Postgres

**Important for Production:**
- Use different ENCRYPTION_KEY than development
- Use different NEXTAUTH_SECRET than development
- Update Google OAuth redirect URIs to include production domain
- Set `NEXTAUTH_URL` to your production domain

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - It's already in `.gitignore`
   - Double-check before committing

2. **Use different keys for each environment**
   - Development, staging, and production should have unique keys

3. **Rotate keys periodically**
   - Change NEXTAUTH_SECRET every 6-12 months
   - If ENCRYPTION_KEY is compromised, you'll need to re-encrypt all API keys

4. **Store production keys securely**
   - Use Vercel's environment variable encryption
   - Consider using a secrets manager for team access

5. **Limit access to environment variables**
   - Only give team members access to environments they need

## Verification

After setting up your environment variables, verify the configuration:

1. **Check that all required variables are set:**
   ```bash
   node -e "require('dotenv').config({ path: '.env.local' }); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing'); console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? '✓ Set' : '✗ Missing'); console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing'); console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Missing'); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing'); console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');"
   ```

2. **Test database connection:**
   ```bash
   npm run db:migrate
   ```

3. **Test encryption:**
   ```bash
   node -e "const crypto = require('crypto'); const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); console.log('Encryption key length:', key.length, 'bytes', key.length === 32 ? '✓' : '✗ Should be 32 bytes');"
   ```

## Troubleshooting

### "ENCRYPTION_KEY must be 32 bytes"
- Ensure your ENCRYPTION_KEY is exactly 64 hexadecimal characters
- Regenerate using: `node scripts/generate-keys.js`

### "Invalid NEXTAUTH_SECRET"
- Ensure NEXTAUTH_SECRET is set and not empty
- Regenerate using: `node scripts/generate-keys.js`

### "Google OAuth redirect_uri_mismatch"
- Check that your redirect URI in Google Cloud Console matches exactly
- Format: `http://localhost:3000/api/auth/callback/google` (for local)
- No trailing slashes

### "Database connection failed"
- Verify DATABASE_URL is correct
- Check that your database server is running
- Ensure network connectivity to the database

## Next Steps

After configuring environment variables:

1. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

2. **Seed the database:**
   ```bash
   npm run db:seed
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Test authentication:**
   - Visit http://localhost:3000
   - Try logging in with Google
   - Try accessing admin dashboard at http://localhost:3000/admin

## References

- [NextAuth.js Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
