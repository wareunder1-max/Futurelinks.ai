# AI FutureLinks Platform - Deployment Guide

This comprehensive guide covers the complete deployment process for the AI FutureLinks Platform, including environment setup, database migrations, admin account creation, and API key configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variable Setup](#environment-variable-setup)
3. [Database Migration Process](#database-migration-process)
4. [Initial Admin Account Creation](#initial-admin-account-creation)
5. [API Key Configuration](#api-key-configuration)
6. [Deployment Verification](#deployment-verification)
7. [Post-Deployment Tasks](#post-deployment-tasks)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the AI FutureLinks Platform, ensure you have:

- ✅ Vercel account with billing enabled
- ✅ GitHub repository connected to Vercel
- ✅ Google Cloud account for OAuth credentials
- ✅ Access to AI provider accounts (OpenAI, Google Gemini, Anthropic)
- ✅ Node.js 18+ installed locally (for verification)
- ✅ Vercel CLI installed (optional): `npm i -g vercel`

## Environment Variable Setup

### Overview

The platform requires 11 environment variables for full functionality. This section provides detailed setup instructions for each variable.

### Step 1: Access Vercel Environment Variables

1. Log in to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Database Configuration

#### DATABASE_URL (Required)

**Purpose**: Connection string for Prisma Client with connection pooling

**Format**:
```
postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15
```


**How to obtain**:
1. In Vercel Dashboard, go to **Storage** tab
2. Create a new Postgres database or select existing
3. Click on the database name
4. Copy the **Pooled Connection String** (includes `pgbouncer=true`)
5. Paste into `DATABASE_URL` environment variable

**Important notes**:
- Must include `pgbouncer=true` for connection pooling
- Must include `sslmode=require` for secure connections
- Connection timeout set to 15 seconds for reliability

**Environments**: Production, Preview, Development

#### DIRECT_URL (Required)

**Purpose**: Direct database connection for migrations (bypasses connection pooling)

**Format**:
```
postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

**How to obtain**:
1. In the same Vercel Postgres database settings
2. Copy the **Direct Connection String** (without `pgbouncer`)
3. Paste into `DIRECT_URL` environment variable

**Important notes**:
- Does NOT include `pgbouncer=true`
- Used exclusively for running migrations
- Must point to the same database as `DATABASE_URL`

**Environments**: Production, Preview, Development

### Step 3: Security & Encryption

#### ENCRYPTION_KEY (Required)

**Purpose**: 32-byte hex string for AES-256-GCM encryption of API keys stored in the database

**How to generate**:
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using the project script
npm run env:generate
```

**Example output**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Critical warnings**:
- ⚠️ **NEVER lose this key** - you cannot decrypt existing API keys without it
- ⚠️ **Generate a unique key for production** - never reuse development keys
- ⚠️ **Store securely** - treat this like a master password
- ⚠️ **Changing this key** will make all existing encrypted API keys unreadable

**Environments**: Production, Preview, Development (use different keys per environment)

### Step 4: NextAuth Configuration

#### NEXTAUTH_URL (Required)

**Purpose**: The canonical URL of your deployed application

**Values by environment**:
- **Production**: `https://ai.futurelinks.art`
- **Preview**: `https://your-preview-url.vercel.app`
- **Development**: `http://localhost:3000`

**How to set**:
1. For production, use your custom domain or Vercel-provided domain
2. For preview, use the preview deployment URL pattern
3. For development, use localhost

**Important notes**:
- Must match the actual deployment URL exactly
- Must include protocol (https:// or http://)
- No trailing slash

**Environments**: Set different values per environment

#### NEXTAUTH_SECRET (Required)

**Purpose**: Secret key for signing and encrypting JWT tokens

**How to generate**:
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 2: Using the project script
npm run env:generate
```

**Example output**:
```
Xk7mP9qR2sT5vW8yZ1aB4cD6eF9gH2jK5lM8nP1qR4sT7vW0yZ3aB6cD9eF2gH5j
```

**Important notes**:
- Use a different secret for each environment
- Changing this secret will invalidate all existing sessions
- Store securely in Vercel environment variables

**Environments**: Production, Preview, Development (use different secrets per environment)

### Step 5: Google OAuth Credentials

#### GOOGLE_CLIENT_ID (Required)

**Purpose**: Google OAuth 2.0 Client ID for user authentication

**How to obtain**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project or create a new one
3. Click **Create Credentials** → **OAuth 2.0 Client ID**
4. Select **Web application** as application type
5. Add authorized redirect URIs:
   - Production: `https://ai.futurelinks.art/api/auth/callback/google`
   - Preview: `https://your-preview-url.vercel.app/api/auth/callback/google`
   - Development: `http://localhost:3000/api/auth/callback/google`
6. Click **Create**
7. Copy the **Client ID**

**Format**:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Environments**: Production, Preview, Development (can use same client ID or separate ones)

#### GOOGLE_CLIENT_SECRET (Required)

**Purpose**: Google OAuth 2.0 Client Secret for user authentication

**How to obtain**:
1. In the same OAuth 2.0 Client ID settings
2. Copy the **Client Secret**
3. Store securely in Vercel environment variables

**Important notes**:
- Keep this secret secure - never commit to version control
- Can use the same client ID/secret across environments or create separate ones
- If compromised, regenerate in Google Cloud Console

**Environments**: Production, Preview, Development

### Step 6: Initial Admin Account

#### INITIAL_ADMIN_USERNAME (Required)

**Purpose**: Username for the first admin account created during database seeding

**Default value**: `admin`

**How to set**:
1. Choose a unique username (alphanumeric, no spaces)
2. Add to Vercel environment variables
3. This account is created automatically on first deployment

**Important notes**:
- Used only for initial account creation
- Can be changed after first login
- Recommended to use a non-obvious username for security

**Environments**: Production, Preview, Development

#### INITIAL_ADMIN_PASSWORD (Required)

**Purpose**: Password for the first admin account

**How to set**:
1. Generate a strong password (minimum 8 characters)
2. Add to Vercel environment variables
3. **Change immediately after first login**

**Password requirements**:
- Minimum 8 characters
- Recommended: Mix of uppercase, lowercase, numbers, and symbols
- Use a password manager to generate and store

**Critical warnings**:
- ⚠️ **Change this password immediately** after first login
- ⚠️ **Never use a weak password** in production
- ⚠️ **Store securely** - this grants full admin access

**Environments**: Production, Preview, Development (use different passwords per environment)

### Step 7: Optional Email Provider

#### EMAIL_SERVER (Optional)

**Purpose**: SMTP server for sending magic link authentication emails

**Format**:
```
smtp://username:password@smtp.example.com:587
```

**Common providers**:
- **SendGrid**: `smtp://apikey:YOUR_API_KEY@smtp.sendgrid.net:587`
- **Mailgun**: `smtp://postmaster@domain.com:password@smtp.mailgun.org:587`
- **AWS SES**: `smtp://username:password@email-smtp.region.amazonaws.com:587`

**Note**: If not configured, only Google OAuth will be available for authentication.

**Environments**: Production, Preview (optional for Development)

#### EMAIL_FROM (Optional)

**Purpose**: Sender email address for magic link emails

**Format**:
```
noreply@futurelinks.art
```

**Requirements**:
- Must be a verified sender in your email provider
- Should be a no-reply address
- Must match your domain

**Environments**: Production, Preview (optional for Development)

### Step 8: Monitoring (Optional)

#### Sentry Configuration

For error tracking and performance monitoring, add these variables:

- **SENTRY_DSN**: Your Sentry project DSN
- **SENTRY_ORG**: Your Sentry organization slug
- **SENTRY_PROJECT**: Your Sentry project slug
- **SENTRY_AUTH_TOKEN**: Auth token for uploading source maps
- **NEXT_PUBLIC_SENTRY_ENABLED**: Set to `true` to enable Sentry

See [TASK_15.5_MONITORING_SETUP.md](./TASK_15.5_MONITORING_SETUP.md) for detailed instructions.

### Environment Variables Summary Table

| Variable | Required | Type | Purpose |
|----------|----------|------|---------|
| DATABASE_URL | ✅ Yes | Secret | Pooled database connection |
| DIRECT_URL | ✅ Yes | Secret | Direct database connection |
| ENCRYPTION_KEY | ✅ Yes | Secret | API key encryption |
| NEXTAUTH_URL | ✅ Yes | Public | Application URL |
| NEXTAUTH_SECRET | ✅ Yes | Secret | JWT signing key |
| GOOGLE_CLIENT_ID | ✅ Yes | Public | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | ✅ Yes | Secret | Google OAuth secret |
| INITIAL_ADMIN_USERNAME | ✅ Yes | Public | First admin username |
| INITIAL_ADMIN_PASSWORD | ✅ Yes | Secret | First admin password |
| EMAIL_SERVER | ❌ No | Secret | SMTP server |
| EMAIL_FROM | ❌ No | Public | Sender email |

### Verification

After setting all environment variables:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Verify configuration
npm run env:verify
```

## Database Migration Process

### Overview

Database migrations ensure your database schema matches the application code. This section covers running migrations during deployment and troubleshooting common issues.

### Automatic Migrations

Migrations run automatically during the Vercel build process via the `npm run build` script, which includes:

```bash
prisma generate && prisma migrate deploy && next build
```

**What happens**:
1. `prisma generate` - Generates Prisma Client based on schema
2. `prisma migrate deploy` - Applies pending migrations to database
3. `next build` - Builds the Next.js application

### Manual Migration Process

If you need to run migrations manually:

#### Step 1: Pull Environment Variables

```bash
# Pull production environment variables
vercel env pull .env.local
```

#### Step 2: Run Migrations

```bash
# Deploy all pending migrations
npm run db:migrate:deploy

# Or use Prisma CLI directly
npx prisma migrate deploy
```

#### Step 3: Verify Migration Status

```bash
# Check migration status
npx prisma migrate status
```

### Creating New Migrations

When you modify the Prisma schema:

#### Step 1: Create Migration Locally

```bash
# Create a new migration
npm run db:migrate

# Or with Prisma CLI
npx prisma migrate dev --name your_migration_name
```

#### Step 2: Test Migration

```bash
# Test the migration locally
npm run db:migrate:deploy

# Verify schema
npx prisma db push
```

#### Step 3: Commit and Deploy

```bash
# Commit migration files
git add prisma/migrations
git commit -m "Add migration: your_migration_name"

# Push to trigger deployment
git push origin main
```

### Migration Best Practices

1. **Always test migrations locally** before deploying to production
2. **Use descriptive migration names** (e.g., `add_user_email_index`)
3. **Review generated SQL** in migration files before applying
4. **Backup database** before running migrations in production
5. **Monitor migration execution** in Vercel build logs

### Troubleshooting Migrations

#### Issue: Migration fails during build

**Symptoms**:
```
Error: P3009: migrate found failed migrations
```

**Solution**:
1. Check Vercel build logs for specific error
2. Verify `DIRECT_URL` is set correctly
3. Ensure database is accessible from Vercel
4. Check for conflicting migrations

```bash
# Reset migration history (CAUTION: development only)
npx prisma migrate reset

# Mark migration as applied
npx prisma migrate resolve --applied migration_name
```

#### Issue: Schema drift detected

**Symptoms**:
```
Error: P3006: Migration `migration_name` failed to apply cleanly to the shadow database
```

**Solution**:
1. Ensure local schema matches production
2. Pull latest migrations from repository
3. Reset local database and reapply migrations

```bash
# Pull latest code
git pull origin main

# Reset local database
npm run db:reset

# Reapply migrations
npm run db:migrate:deploy
```

#### Issue: Connection timeout during migration

**Symptoms**:
```
Error: P1001: Can't reach database server
```

**Solution**:
1. Verify `DIRECT_URL` includes `connect_timeout=15`
2. Check database is running and accessible
3. Verify SSL mode is set correctly (`sslmode=require`)
4. Check Vercel Postgres status in dashboard

### Migration Rollback

If a migration causes issues in production:

#### Step 1: Identify Problem Migration

```bash
# Check migration status
npx prisma migrate status
```

#### Step 2: Create Rollback Migration

```bash
# Create a new migration that reverses changes
npx prisma migrate dev --name rollback_migration_name
```

#### Step 3: Deploy Rollback

```bash
# Commit and push
git add prisma/migrations
git commit -m "Rollback: migration_name"
git push origin main
```

**Note**: Prisma doesn't support automatic rollbacks. You must create a new migration that reverses the changes.

## Initial Admin Account Creation

### Overview

The initial admin account is created automatically during database seeding. This section covers the creation process, verification, and first login.

### Automatic Creation

The admin account is created automatically when:
1. The database is seeded for the first time
2. No admin account exists with the specified username
3. Environment variables `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` are set

### Seed Process

The seed script (`prisma/seed.ts`) runs during:
- Initial deployment
- Manual execution: `npm run db:seed`
- Database reset: `npm run db:reset`

**What the seed script does**:
1. Checks if admin account exists
2. If not, creates admin account with:
   - Username from `INITIAL_ADMIN_USERNAME`
   - Password hashed with bcrypt (12 rounds)
   - Created timestamp
3. Creates sample blog posts (if none exist)

### Manual Admin Account Creation

If you need to create an admin account manually:

#### Step 1: Access Database

```bash
# Open Prisma Studio
npm run db:studio
```

#### Step 2: Create Admin Record

1. Navigate to the `Admin` table
2. Click **Add record**
3. Fill in fields:
   - **username**: Your desired username
   - **passwordHash**: Use bcrypt to hash your password
   - **createdAt**: Current timestamp
   - **lastLoginAt**: Current timestamp

#### Step 3: Generate Password Hash

```bash
# Use Node.js to generate bcrypt hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 12));"
```

### First Login

After deployment, log in to the admin dashboard:

#### Step 1: Navigate to Admin Login

```
https://ai.futurelinks.art/admin/login
```

#### Step 2: Enter Credentials

- **Username**: Value from `INITIAL_ADMIN_USERNAME`
- **Password**: Value from `INITIAL_ADMIN_PASSWORD`

#### Step 3: Change Password Immediately

1. After successful login, navigate to **Admin Management**
2. Click **Change Password**
3. Enter current password
4. Enter new strong password
5. Confirm new password
6. Click **Save**

**Critical**: Always change the initial password immediately after first login for security.

### Verification

Verify the admin account was created successfully:

#### Method 1: Check Database

```bash
# Open Prisma Studio
npm run db:studio

# Navigate to Admin table
# Verify record exists with correct username
```

#### Method 2: Check Logs

```bash
# Check Vercel function logs
# Look for "Admin account created" message
```

#### Method 3: Test Login

1. Navigate to `/admin/login`
2. Enter credentials
3. Verify successful login and redirect to `/admin/keys`

### Troubleshooting Admin Account

#### Issue: Cannot log in with initial credentials

**Possible causes**:
1. Admin account not created during seed
2. Password hash mismatch
3. Environment variables not set correctly

**Solution**:
```bash
# Check if admin exists
npm run db:studio
# Navigate to Admin table and verify record

# If missing, run seed manually
npm run db:seed

# If exists, verify environment variables
vercel env pull .env.local
cat .env.local | grep INITIAL_ADMIN
```

#### Issue: "Invalid credentials" error

**Possible causes**:
1. Incorrect username or password
2. Password not hashed correctly
3. Session configuration issue

**Solution**:
1. Verify credentials match environment variables exactly
2. Check for typos or extra spaces
3. Try resetting password via database

#### Issue: Admin account created but cannot access dashboard

**Possible causes**:
1. Session not created correctly
2. NextAuth configuration issue
3. Database connection issue

**Solution**:
1. Check browser console for errors
2. Verify `NEXTAUTH_URL` matches deployment URL
3. Check Vercel function logs for authentication errors

## API Key Configuration

### Overview

After deploying and logging in as admin, you need to configure API keys for AI providers. This section covers adding, managing, and testing API keys.

### Supported AI Providers

The platform supports the following AI providers:
- **OpenAI** (GPT-4, GPT-3.5, etc.)
- **Google Gemini** (Gemini Pro, Gemini Ultra)
- **Anthropic** (Claude 3, Claude 2)

### Adding API Keys

#### Step 1: Obtain API Keys from Providers

**OpenAI**:
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key (starts with `sk-`)
4. Store securely

**Google Gemini**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key
4. Store securely

**Anthropic**:
1. Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Click **Create key**
3. Copy the key (starts with `sk-ant-`)
4. Store securely

#### Step 2: Add Keys to Platform

1. Log in to admin dashboard: `https://ai.futurelinks.art/admin/login`
2. Navigate to **API Keys** section
3. Click **Add New Key**
4. Fill in the form:
   - **Provider**: Select from dropdown (OpenAI, Gemini, Anthropic)
   - **API Key**: Paste the key from provider
5. Click **Save**
6. Verify confirmation message appears

#### Step 3: Verify Key Added

1. Check the API Keys list
2. Verify new key appears with:
   - Provider name
   - Masked key value (e.g., `sk-...xyz`)
   - Created timestamp
   - Last used: "Never" (initially)

### Managing API Keys

#### Editing API Keys

1. In API Keys list, click **Edit** button for the key
2. Modify provider or key value
3. Click **Save**
4. Verify confirmation message

**Note**: Editing a key updates the encrypted value in the database.

#### Deleting API Keys

1. In API Keys list, click **Delete** button for the key
2. Confirm deletion in the dialog
3. Verify confirmation message
4. Key and associated usage metrics are removed

**Warning**: Deletion is permanent and cannot be undone.

#### Viewing Usage Metrics

1. Navigate to **Usage** section in admin dashboard
2. View metrics for each API key:
   - Total requests
   - Last used timestamp
   - Requests by day (chart)
3. Filter by date range if needed

### Testing API Keys

After adding API keys, test them in the chat interface:

#### Step 1: Access Chat Interface

1. Log out of admin dashboard (or use incognito window)
2. Navigate to `https://ai.futurelinks.art`
3. Click **Get Started** or **Sign In**
4. Authenticate with Google OAuth

#### Step 2: Send Test Message

1. In chat interface, type a test message
2. Click **Send** or press Enter
3. Wait for AI response (should appear within 10 seconds)
4. Verify response is relevant and complete

#### Step 3: Verify Usage Tracking

1. Log back in to admin dashboard
2. Navigate to **Usage** section
3. Verify the API key shows:
   - Total requests: 1 (or incremented)
   - Last used: Recent timestamp
4. Check **Monitoring** section for request metrics

### API Key Security

#### Encryption

All API keys are encrypted before storage using:
- **Algorithm**: AES-256-GCM
- **Key**: `ENCRYPTION_KEY` environment variable
- **Storage**: Encrypted in `APIKey.encryptedKey` column

#### Best Practices

1. **Rotate keys regularly** (every 90 days recommended)
2. **Use separate keys** for development and production
3. **Monitor usage** for unexpected spikes
4. **Delete unused keys** immediately
5. **Never share keys** or commit to version control
6. **Set spending limits** in provider dashboards

#### Key Rotation Process

1. Obtain new API key from provider
2. Add new key to platform
3. Test new key in chat interface
4. Monitor usage to ensure new key is being used
5. Delete old key after verification period

### Troubleshooting API Keys

#### Issue: "No API keys available" error

**Symptoms**: Chat interface shows error when sending message

**Solution**:
1. Verify at least one API key is added in admin dashboard
2. Check API key is valid (not expired or revoked)
3. Test key directly with provider's API
4. Check Vercel function logs for specific errors

#### Issue: API key not working

**Symptoms**: Chat returns error or no response

**Solution**:
1. Verify key is correct (no typos or extra spaces)
2. Check provider dashboard for key status
3. Verify spending limits not exceeded
4. Test key with provider's API directly
5. Check Vercel function logs for error details

#### Issue: Usage metrics not updating

**Symptoms**: Last used timestamp not changing

**Solution**:
1. Verify chat requests are completing successfully
2. Check database for `UsageLog` entries
3. Review Vercel function logs for tracking errors
4. Ensure `trackProxyRequest()` is being called

## Deployment Verification

After completing all setup steps, verify the deployment:

### Checklist

- [ ] **Environment Variables**: All required variables set in Vercel
- [ ] **Database**: Migrations applied successfully
- [ ] **Admin Account**: Can log in with initial credentials
- [ ] **Password Changed**: Initial password changed to secure password
- [ ] **API Keys**: At least one API key added for each provider
- [ ] **Chat Interface**: Can send messages and receive responses
- [ ] **Usage Tracking**: Metrics updating correctly
- [ ] **Monitoring**: Vercel Analytics and monitoring dashboard working
- [ ] **SEO**: Sitemap and robots.txt accessible
- [ ] **Performance**: Core Web Vitals meet targets
- [ ] **Security**: HTTPS enforced, security headers present

### Automated Verification

Run the verification script:

```bash
# Pull environment variables
vercel env pull .env.local

# Run verification
npm run env:verify

# Check database connection
npm run db:studio
```

### Manual Verification

#### 1. Landing Page

- Visit `https://ai.futurelinks.art`
- Verify page loads within 2 seconds
- Check hero section displays correctly
- Verify navigation links work

#### 2. Authentication

- Click **Sign In**
- Test Google OAuth flow
- Verify redirect to chat interface
- Test logout functionality

#### 3. Chat Interface

- Send a test message
- Verify AI response within 10 seconds
- Check message history displays correctly
- Test with different providers (if multiple keys added)

#### 4. Admin Dashboard

- Navigate to `/admin/login`
- Log in with admin credentials
- Verify all sections accessible:
  - API Keys
  - Usage
  - Admin Management
  - Monitoring
- Test adding/editing/deleting API keys

#### 5. SEO Elements

- Visit `https://ai.futurelinks.art/sitemap.xml`
- Visit `https://ai.futurelinks.art/robots.txt`
- Check meta tags in page source
- Verify JSON-LD structured data on blog posts

#### 6. Performance

- Run Lighthouse audit
- Verify Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Check Vercel Speed Insights dashboard

## Post-Deployment Tasks

### Immediate Tasks (Day 1)

1. **Change Admin Password**
   - Log in to admin dashboard
   - Navigate to Admin Management
   - Change password to secure value
   - Store in password manager

2. **Add API Keys**
   - Add keys for all AI providers you plan to use
   - Test each key in chat interface
   - Verify usage tracking works

3. **Configure Monitoring**
   - Set up Sentry (if using)
   - Configure alert notifications
   - Test error tracking

4. **Submit Sitemap**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add property for your domain
   - Submit sitemap: `https://ai.futurelinks.art/sitemap.xml`

### Short-term Tasks (Week 1)

1. **Monitor Performance**
   - Check Vercel Analytics daily
   - Review error logs
   - Monitor API usage and costs

2. **Test All Features**
   - Test authentication flows
   - Test chat with all providers
   - Test admin dashboard functions
   - Test on mobile devices

3. **Security Audit**
   - Verify HTTPS enforcement
   - Check security headers
   - Review environment variables
   - Test session timeout

4. **Documentation**
   - Document any custom configurations
   - Create runbook for common issues
   - Document API key rotation process

### Ongoing Tasks

1. **Weekly**
   - Review error logs
   - Check API usage metrics
   - Monitor database performance
   - Review security alerts

2. **Monthly**
   - Update dependencies
   - Review and rotate API keys
   - Check for security advisories
   - Backup database

3. **Quarterly**
   - Rotate encryption keys
   - Update admin passwords
   - Audit user access
   - Review and optimize performance

## Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Build fails with "Environment variable not found"

**Solution**:
1. Verify all required environment variables are set in Vercel
2. Check variable names match exactly (case-sensitive)
3. Ensure variables are set for correct environment (Production/Preview/Development)

**Issue**: Build fails with Prisma errors

**Solution**:
1. Verify `DATABASE_URL` and `DIRECT_URL` are set correctly
2. Check database is accessible from Vercel
3. Ensure migrations are in sync with schema

#### Runtime Errors

**Issue**: 500 errors on API routes

**Solution**:
1. Check Vercel function logs for specific error
2. Verify environment variables are set
3. Check database connection
4. Review recent code changes

**Issue**: Authentication not working

**Solution**:
1. Verify `NEXTAUTH_URL` matches deployment URL exactly
2. Check Google OAuth credentials
3. Ensure redirect URIs are configured in Google Console
4. Check browser console for errors

#### Database Issues

**Issue**: Connection timeout errors

**Solution**:
1. Verify `DATABASE_URL` includes `connect_timeout=15`
2. Check Vercel Postgres status in dashboard
3. Ensure connection pooling is enabled (`pgbouncer=true`)
4. Review connection pool usage

**Issue**: Migration fails

**Solution**:
1. Check `DIRECT_URL` is set correctly
2. Verify database is accessible
3. Review migration SQL for errors
4. Check for schema drift

### Getting Help

If you encounter issues not covered in this guide:

1. **Check Documentation**
   - Review [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
   - Check [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (if available)

2. **Check Logs**
   - Vercel function logs in dashboard
   - Browser console for client-side errors
   - Database logs in Vercel Postgres dashboard

3. **Verify Configuration**
   - Run `npm run env:verify`
   - Check all environment variables are set
   - Verify database connection

4. **Contact Support**
   - Open issue on GitHub repository
   - Contact development team
   - Check Vercel support documentation

## Summary

This deployment guide covered:

- ✅ **Environment Variable Setup**: Detailed instructions for all 11 required variables
- ✅ **Database Migration Process**: Automatic and manual migration procedures
- ✅ **Initial Admin Account Creation**: Automatic creation and first login
- ✅ **API Key Configuration**: Adding, managing, and testing API keys
- ✅ **Deployment Verification**: Comprehensive checklist and testing procedures
- ✅ **Post-Deployment Tasks**: Immediate, short-term, and ongoing maintenance
- ✅ **Troubleshooting**: Common issues and solutions

**Requirements Validated**: 7.7, 8.4, 17.4

---

**Last Updated**: 2024
**Version**: 1.0.0

For additional deployment resources, see:
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Comprehensive Vercel deployment guide
- [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) - Quick reference checklist
- [TASK_15.5_MONITORING_SETUP.md](./TASK_15.5_MONITORING_SETUP.md) - Monitoring configuration
