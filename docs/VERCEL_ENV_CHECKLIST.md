# Vercel Environment Variables Checklist

This is a quick reference checklist for setting up environment variables in the Vercel dashboard.

## Required Environment Variables

### ✅ Database Configuration

- [ ] **DATABASE_URL**
  - Type: Vercel Postgres (Pooled Connection)
  - Format: `postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15`
  - Source: Vercel Postgres dashboard → Connection String (Pooled)
  - Environments: Production, Preview, Development

- [ ] **DIRECT_URL**
  - Type: Vercel Postgres (Direct Connection)
  - Format: `postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb?sslmode=require`
  - Source: Vercel Postgres dashboard → Connection String (Direct)
  - Environments: Production, Preview, Development

### ✅ Security & Encryption

- [ ] **ENCRYPTION_KEY**
  - Type: Secret (32-byte hex string)
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Purpose: Encrypts API keys in database
  - Environments: Production, Preview, Development
  - ⚠️ **CRITICAL**: Never lose this key or you cannot decrypt stored API keys

### ✅ NextAuth Configuration

- [ ] **NEXTAUTH_URL**
  - Type: URL
  - Production: `https://ai.futurelinks.art`
  - Preview: `https://your-preview-url.vercel.app`
  - Development: `http://localhost:3000`
  - Environments: Set different values per environment

- [ ] **NEXTAUTH_SECRET**
  - Type: Secret (Base64 string)
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Purpose: Signs and encrypts JWT tokens
  - Environments: Production, Preview, Development
  - ⚠️ **IMPORTANT**: Use different secrets for each environment

### ✅ Google OAuth

- [ ] **GOOGLE_CLIENT_ID**
  - Type: Public
  - Format: `your-client-id.apps.googleusercontent.com`
  - Source: Google Cloud Console → APIs & Services → Credentials
  - Environments: Production, Preview, Development

- [ ] **GOOGLE_CLIENT_SECRET**
  - Type: Secret
  - Source: Google Cloud Console → APIs & Services → Credentials
  - Environments: Production, Preview, Development
  - ⚠️ **NOTE**: Configure authorized redirect URIs in Google Console:
    - Production: `https://ai.futurelinks.art/api/auth/callback/google`
    - Preview: `https://your-preview-url.vercel.app/api/auth/callback/google`
    - Development: `http://localhost:3000/api/auth/callback/google`

### ✅ Initial Admin Account

- [ ] **INITIAL_ADMIN_USERNAME**
  - Type: Public
  - Default: `admin`
  - Purpose: Creates first admin account
  - Environments: Production, Preview, Development

- [ ] **INITIAL_ADMIN_PASSWORD**
  - Type: Secret
  - Purpose: Password for first admin account
  - Environments: Production, Preview, Development
  - ⚠️ **CRITICAL**: Change this password immediately after first login!

## Optional Environment Variables

### 📧 Email Provider (for magic link authentication)

- [ ] **EMAIL_SERVER**
  - Type: Secret
  - Format: `smtp://user:password@smtp.example.com:587`
  - Purpose: SMTP server for sending magic links
  - Environments: Production, Preview (optional for Development)

- [ ] **EMAIL_FROM**
  - Type: Public
  - Format: `noreply@futurelinks.art`
  - Purpose: Sender email address
  - Environments: Production, Preview (optional for Development)

## Environment Variable Setup Steps

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com
2. Select your project
3. Navigate to "Settings" → "Environment Variables"

### Step 2: Set Up Vercel Postgres
1. Go to "Storage" tab
2. Create new Postgres database (or select existing)
3. Copy connection strings:
   - Pooled connection → `DATABASE_URL`
   - Direct connection → `DIRECT_URL`

### Step 3: Generate Secrets
Run these commands locally to generate secure secrets:

```bash
# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 4: Configure Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (or use existing)
3. Add authorized redirect URIs for each environment
4. Copy Client ID and Client Secret

### Step 5: Add Variables to Vercel
For each variable:
1. Click "Add New" in Environment Variables section
2. Enter variable name (e.g., `DATABASE_URL`)
3. Enter variable value
4. Select environments (Production, Preview, Development)
5. Click "Save"

### Step 6: Verify Configuration
After adding all variables:
1. Trigger a new deployment (push to main branch)
2. Check build logs for any missing variables
3. Test the deployed application
4. Verify authentication works
5. Login to admin dashboard and test functionality

## Quick Verification Script

You can verify your environment variables locally before deploying:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Verify all required variables are set
npm run env:verify
```

## Common Issues

### ❌ Build fails with "DATABASE_URL is not defined"
**Solution**: Ensure DATABASE_URL is set in Vercel environment variables for the correct environment

### ❌ Authentication redirects to wrong URL
**Solution**: Verify NEXTAUTH_URL matches your deployment URL for each environment

### ❌ Google OAuth fails with "redirect_uri_mismatch"
**Solution**: Add the correct redirect URI in Google Cloud Console for your environment

### ❌ Cannot decrypt API keys after deployment
**Solution**: Ensure ENCRYPTION_KEY is the same across all deployments. If you changed it, you'll need to re-enter all API keys.

### ❌ Admin login fails
**Solution**: Verify INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD are set correctly. Check database to ensure admin account was created.

## Security Reminders

- ✅ Never commit `.env.local` or `.env` files to version control
- ✅ Use different secrets for production and preview environments
- ✅ Rotate ENCRYPTION_KEY and NEXTAUTH_SECRET quarterly
- ✅ Change INITIAL_ADMIN_PASSWORD immediately after first login
- ✅ Use strong, unique passwords for all secrets
- ✅ Enable 2FA on your Vercel account
- ✅ Regularly audit environment variables and remove unused ones

## Next Steps After Configuration

1. ✅ Deploy to production
2. ✅ Verify deployment at your production URL
3. ✅ Test authentication flow (Google OAuth)
4. ✅ Login to admin dashboard
5. ✅ Change admin password
6. ✅ Add API keys for AI providers
7. ✅ Test chat interface
8. ✅ Verify usage tracking
9. ✅ Check SEO elements (sitemap, robots.txt, meta tags)
10. ✅ Monitor Vercel Analytics for performance

---

**Need Help?**
- See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions
- Check [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for local development setup
- Review Vercel function logs in the dashboard for runtime errors
