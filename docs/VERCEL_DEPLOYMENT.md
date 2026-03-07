# Vercel Deployment Guide

This document provides comprehensive instructions for deploying the AI FutureLinks Platform to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel
- Vercel CLI installed (optional, for local testing): `npm i -g vercel`

## Deployment Configuration

The project includes a `vercel.json` configuration file that optimizes the deployment for the AI FutureLinks Platform.

### Build Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

- **buildCommand**: Runs Prisma generation and Next.js build
- **devCommand**: Starts the development server
- **installCommand**: Installs dependencies
- **framework**: Identifies the project as Next.js for automatic optimizations

### Serverless Functions Configuration

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

- **runtime**: Node.js 20.x for latest features and performance
- **maxDuration**: 30 seconds timeout for API routes (handles AI provider responses)
- **memory**: 1024 MB for handling AI proxy requests and database operations

### Edge Functions

API routes in the `app/api/` directory are automatically deployed as serverless functions. For optimal performance:

- Authentication routes (`/api/auth/*`) use NextAuth.js edge-compatible runtime
- Proxy routes (`/api/proxy`) handle streaming AI responses
- Admin routes (`/api/admin/*`) include session validation middleware

### Security Headers

The configuration includes security headers for all routes:

- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Caching Strategy

- **API Routes**: No caching (`no-store, no-cache, must-revalidate`)
- **Static Images**: 1 year cache with immutable flag
- **Static Assets** (JS, CSS, fonts): 1 year cache with immutable flag

### Regions

```json
{
  "regions": ["iad1"]
}
```

The deployment is configured for the `iad1` region (US East - Washington, D.C.) for optimal performance. You can add additional regions for global distribution:

- `sfo1` - US West (San Francisco)
- `lhr1` - Europe (London)
- `hnd1` - Asia (Tokyo)

## Environment Variables Setup

### Required Environment Variables

You must configure the following environment variables in the Vercel dashboard:

#### 1. Database Configuration

**DATABASE_URL** (Vercel Postgres - Connection Pooling)
```
postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15
```

**DIRECT_URL** (Vercel Postgres - Direct Connection)
```
postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

**How to get these values:**
1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database or select an existing one
4. Copy the connection strings from the database settings
5. The `DATABASE_URL` should use the pooled connection (with `pgbouncer=true`)
6. The `DIRECT_URL` should use the direct connection (without `pgbouncer`)

#### 2. Security & Encryption

**ENCRYPTION_KEY** (32-byte hex string)
```
Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This key is used for AES-256-GCM encryption of API keys stored in the database.

**IMPORTANT**: 
- Generate a unique key for production
- Never commit this key to version control
- Store it securely in Vercel environment variables
- If you lose this key, you cannot decrypt existing API keys

#### 3. NextAuth Configuration

**NEXTAUTH_URL** (Production URL)
```
https://ai.futurelinks.art
```

**NEXTAUTH_SECRET** (Random secret for JWT signing)
```
Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 4. Google OAuth Credentials

**GOOGLE_CLIENT_ID**
```
your-client-id.apps.googleusercontent.com
```

**GOOGLE_CLIENT_SECRET**
```
your-client-secret
```

**How to get these values:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID (or use existing)
3. Set authorized redirect URIs:
   - `https://ai.futurelinks.art/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local testing)
4. Copy the Client ID and Client Secret

#### 5. Email Provider (Optional)

**EMAIL_SERVER** (SMTP connection string)
```
smtp://user:password@smtp.example.com:587
```

**EMAIL_FROM** (Sender email address)
```
noreply@futurelinks.art
```

**Note**: Email authentication is optional. If not configured, only Google OAuth will be available.

#### 6. Initial Admin Credentials

**INITIAL_ADMIN_USERNAME**
```
admin
```

**INITIAL_ADMIN_PASSWORD**
```
your-secure-password-here
```

**IMPORTANT**: 
- Change this password immediately after first login
- Use a strong password (minimum 8 characters)
- This is only used for the initial admin account creation

### Setting Environment Variables in Vercel

#### Via Vercel Dashboard

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable with the following settings:
   - **Name**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environments**: Select "Production", "Preview", and "Development" as needed
4. Click "Save"

#### Via Vercel CLI

```bash
# Set a single environment variable
vercel env add DATABASE_URL production

# Pull environment variables to local .env file
vercel env pull .env.local
```

### Environment Variable Best Practices

1. **Separate Environments**: Use different values for production, preview, and development
2. **Secrets Management**: Never commit secrets to version control
3. **Rotation**: Regularly rotate sensitive credentials (ENCRYPTION_KEY, NEXTAUTH_SECRET)
4. **Documentation**: Keep this document updated when adding new variables
5. **Validation**: Use the `npm run env:verify` script to validate environment variables

## Vercel Postgres Setup

### Creating a Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a region (should match your deployment region)
6. Click "Create"

### Connecting to Vercel Postgres

Vercel automatically injects the following environment variables when you connect a Postgres database:

- `POSTGRES_URL` - Connection string with pooling
- `POSTGRES_URL_NON_POOLING` - Direct connection string
- `POSTGRES_USER` - Database user
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

**Important**: Map these to the required variables:
- `DATABASE_URL` = `POSTGRES_URL` (with `pgbouncer=true`)
- `DIRECT_URL` = `POSTGRES_URL_NON_POOLING`

### Running Database Migrations

Migrations are automatically run during the build process via the `npm run build` script, which includes `prisma generate`.

To manually run migrations:

```bash
# Deploy migrations to production
npm run db:migrate:deploy

# Or use Vercel CLI
vercel env pull .env.local
npm run db:migrate:deploy
```

### Seeding the Database

The initial admin account is created automatically when the application starts if it doesn't exist. This is handled by the seed script referenced in the build process.

To manually seed the database:

```bash
npm run db:seed
```

## Deployment Process

### Automatic Deployment (Recommended)

1. **Connect GitHub Repository**:
   - Go to Vercel dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Configure Environment Variables**:
   - Add all required environment variables (see above)
   - Ensure production values are set

3. **Deploy**:
   - Vercel automatically deploys on every push to the main branch
   - Preview deployments are created for pull requests

### Manual Deployment via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Steps

### 1. Verify Deployment

- Visit your production URL: `https://ai.futurelinks.art`
- Check that the landing page loads correctly
- Verify HTTPS is enforced

### 2. Test Authentication

- Test Google OAuth login flow
- Verify session creation and persistence
- Test logout functionality

### 3. Create Initial Admin Account

- Navigate to `/admin/login`
- Login with `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD`
- Immediately change the admin password

### 4. Configure API Keys

- Add API keys for AI providers (OpenAI, Google Gemini, Anthropic)
- Test the chat interface with each provider
- Verify usage tracking is working

### 5. Monitor Performance

- Check Vercel Analytics for performance metrics
- Verify Core Web Vitals meet targets:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Monitor error rates and response times

### 6. SEO Verification

- Verify sitemap is accessible: `https://ai.futurelinks.art/sitemap.xml`
- Verify robots.txt is accessible: `https://ai.futurelinks.art/robots.txt`
- Check meta tags and Open Graph tags on landing page
- Verify JSON-LD structured data on blog posts
- Submit sitemap to Google Search Console

## Troubleshooting

### Build Failures

**Issue**: Build fails with Prisma errors
```
Solution: Ensure DATABASE_URL and DIRECT_URL are set correctly
Check that the database is accessible from Vercel's build environment
```

**Issue**: Build fails with TypeScript errors
```
Solution: Run `npm run lint` locally to identify issues
Fix type errors before pushing to production
```

### Runtime Errors

**Issue**: 500 errors on API routes
```
Solution: Check Vercel function logs in the dashboard
Verify environment variables are set correctly
Ensure database migrations have been applied
```

**Issue**: Authentication not working
```
Solution: Verify NEXTAUTH_URL matches your production domain
Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
Ensure authorized redirect URIs are configured in Google Console
```

**Issue**: Database connection errors
```
Solution: Verify DATABASE_URL includes pgbouncer=true for pooling
Check that the database is in the same region as your deployment
Ensure connection timeout is set appropriately (connect_timeout=15)
```

### Performance Issues

**Issue**: Slow API responses
```
Solution: Check function execution time in Vercel logs
Consider increasing memory allocation in vercel.json
Optimize database queries with indexes
```

**Issue**: High database connection usage
```
Solution: Ensure connection pooling is enabled (pgbouncer=true)
Review and optimize database queries
Consider implementing caching for frequently accessed data
```

## Monitoring and Maintenance

### Vercel Analytics

Enable Vercel Analytics to monitor:
- Page views and user sessions
- Core Web Vitals (LCP, FID, CLS)
- Geographic distribution of users
- Device and browser statistics

### Error Tracking

Consider integrating an error tracking service:
- Sentry
- LogRocket
- Datadog

### Database Monitoring

Monitor database performance:
- Connection pool usage
- Query execution time
- Slow query logs
- Database size and growth

### Regular Maintenance Tasks

1. **Weekly**:
   - Review error logs
   - Check API usage metrics
   - Monitor database performance

2. **Monthly**:
   - Review and rotate API keys if needed
   - Update dependencies (`npm update`)
   - Review security advisories (`npm audit`)

3. **Quarterly**:
   - Rotate ENCRYPTION_KEY and NEXTAUTH_SECRET
   - Review and update admin passwords
   - Audit user access and permissions

## Security Considerations

### HTTPS Enforcement

Vercel automatically provides HTTPS for all deployments. The middleware.ts file includes additional HTTPS enforcement logic.

### Environment Variable Security

- Never commit `.env.local` or `.env` files to version control
- Use Vercel's encrypted environment variable storage
- Rotate secrets regularly
- Use different values for production and preview environments

### Database Security

- Use connection pooling to prevent connection exhaustion
- Enable SSL/TLS for database connections (`sslmode=require`)
- Regularly backup the database
- Monitor for suspicious activity

### API Security

- All API routes validate authentication
- Admin routes require admin session
- Rate limiting is handled by Vercel's infrastructure
- CORS is configured via Next.js middleware

## Scaling Considerations

### Horizontal Scaling

Vercel automatically scales serverless functions based on demand. No manual configuration required.

### Database Scaling

For high-traffic scenarios:
1. Upgrade Vercel Postgres plan for more connections
2. Implement caching layer (Redis) for frequently accessed data
3. Use read replicas for read-heavy workloads
4. Consider database sharding for very large datasets

### CDN and Caching

Vercel's Edge Network automatically caches static assets. The `vercel.json` configuration includes optimal cache headers for:
- Images: 1 year cache
- JavaScript/CSS: 1 year cache
- API responses: No cache

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Support

For deployment issues:
1. Check Vercel function logs in the dashboard
2. Review this documentation
3. Consult the project's GitHub issues
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
