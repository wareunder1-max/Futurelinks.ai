# Setup Checklist

Use this checklist to ensure you've completed all necessary setup steps for the AI FutureLinks Platform.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] PostgreSQL database available (local or Vercel Postgres)
- [ ] Google Cloud account (for OAuth)

## Initial Setup

### 1. Clone and Install

- [ ] Clone the repository
- [ ] Run `npm install` to install dependencies
- [ ] Verify installation: `npm run build` should complete without errors

### 2. Environment Variables

- [ ] Copy template: `cp .env.local.template .env.local`
- [ ] Generate security keys: `npm run env:generate`
- [ ] Copy generated keys to `.env.local`
- [ ] Verify configuration: `npm run env:verify`

### 3. Database Configuration

- [ ] Set `DATABASE_URL` in `.env.local`
- [ ] Set `DIRECT_URL` in `.env.local`
- [ ] Test connection: `npm run db:migrate`
- [ ] Verify Prisma schema: `npm run db:studio` (opens Prisma Studio)

### 4. Google OAuth Setup

- [ ] Create Google Cloud project
- [ ] Enable Google+ API and Google People API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 Client ID
- [ ] Add authorized redirect URIs:
  - [ ] `http://localhost:3000/api/auth/callback/google`
  - [ ] `https://ai.futurelinks.art/api/auth/callback/google` (production)
- [ ] Copy Client ID to `GOOGLE_CLIENT_ID` in `.env.local`
- [ ] Copy Client Secret to `GOOGLE_CLIENT_SECRET` in `.env.local`

### 5. Security Configuration

- [ ] `ENCRYPTION_KEY` is set (64 hex characters)
- [ ] `NEXTAUTH_SECRET` is set (32+ characters)
- [ ] `NEXTAUTH_URL` is set correctly
- [ ] `INITIAL_ADMIN_PASSWORD` is set (will change after first login)
- [ ] Verify all security settings: `npm run env:verify`

### 6. Database Initialization

- [ ] Run migrations: `npm run db:migrate`
- [ ] Seed database: `npm run db:seed`
- [ ] Verify admin account created (check Prisma Studio)

### 7. Development Server

- [ ] Start server: `npm run dev`
- [ ] Access landing page: http://localhost:3000
- [ ] Test Google OAuth login
- [ ] Access admin dashboard: http://localhost:3000/admin
- [ ] Login with initial admin credentials
- [ ] Change admin password immediately

## Feature Testing

### Public Features

- [ ] Landing page loads correctly
- [ ] Google OAuth login works
- [ ] Chat interface is accessible after login
- [ ] Blog list page displays (if seeded)
- [ ] Blog post detail pages work

### Admin Features

- [ ] Admin login works
- [ ] API key management page loads
- [ ] Can add new API key
- [ ] Can edit existing API key
- [ ] Can delete API key
- [ ] Usage dashboard displays metrics
- [ ] Admin management page works

### Security Features

- [ ] HTTPS redirect works (production)
- [ ] Security headers are present
- [ ] Session timeout works (30 minutes for admin)
- [ ] API keys are encrypted in database
- [ ] Passwords are hashed in database

## Production Deployment

### Vercel Setup

- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Add Vercel Postgres database
- [ ] Configure environment variables in Vercel:
  - [ ] `ENCRYPTION_KEY` (generate new for production!)
  - [ ] `NEXTAUTH_SECRET` (generate new for production!)
  - [ ] `NEXTAUTH_URL` (set to production domain)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `INITIAL_ADMIN_USERNAME`
  - [ ] `INITIAL_ADMIN_PASSWORD`
  - [ ] `EMAIL_SERVER` (optional)
  - [ ] `EMAIL_FROM` (optional)
- [ ] `DATABASE_URL` and `DIRECT_URL` auto-populated by Vercel

### Google OAuth Production

- [ ] Update OAuth consent screen for production
- [ ] Add production domain to authorized JavaScript origins
- [ ] Add production redirect URI to authorized redirect URIs
- [ ] Test OAuth flow on production domain

### Database Migration

- [ ] Run migrations on production: `npm run db:migrate:deploy`
- [ ] Seed production database (if needed)
- [ ] Verify admin account exists

### Post-Deployment

- [ ] Test production site loads
- [ ] Test Google OAuth on production
- [ ] Login to admin dashboard on production
- [ ] Change admin password on production
- [ ] Add production API keys
- [ ] Test chat functionality with real API keys
- [ ] Verify security headers (use securityheaders.com)
- [ ] Test Core Web Vitals (use PageSpeed Insights)

## Monitoring Setup

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure alerts for:
  - [ ] Failed login attempts
  - [ ] API errors
  - [ ] Database connection issues
  - [ ] High API usage

## Documentation

- [ ] Read `docs/ENVIRONMENT_SETUP.md`
- [ ] Read `docs/SECURITY_SETUP.md`
- [ ] Read `docs/DATABASE_SETUP.md`
- [ ] Read `docs/QUICK_START.md`
- [ ] Bookmark important links:
  - [ ] Vercel Dashboard
  - [ ] Google Cloud Console
  - [ ] Database connection info
  - [ ] Production admin URL

## Security Audit

- [ ] All secrets are unique per environment
- [ ] No secrets committed to version control
- [ ] `.env.local` is in `.gitignore`
- [ ] Production secrets backed up securely
- [ ] Admin password changed from initial value
- [ ] HTTPS enforced on production
- [ ] Security headers verified
- [ ] Session timeout tested
- [ ] API key encryption verified
- [ ] Password hashing verified

## Troubleshooting

If you encounter issues, check:

- [ ] `npm run env:verify` passes
- [ ] Database connection works
- [ ] Google OAuth redirect URIs match exactly
- [ ] All required environment variables are set
- [ ] Node.js version is 18+
- [ ] Prisma schema is up to date: `npm run db:migrate`

## Common Issues

### "ENCRYPTION_KEY must be 32 bytes"
- Run `npm run env:generate` and copy the generated key
- Ensure it's exactly 64 hexadecimal characters

### "redirect_uri_mismatch"
- Check Google Cloud Console redirect URIs
- Ensure no trailing slashes
- Verify http vs https
- Check port number (3000 for local)

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check database server is running
- Test connection with Prisma Studio

### "NextAuth session not found"
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

## Next Steps

After completing this checklist:

1. **Add API Keys**: Add your AI provider API keys through the admin dashboard
2. **Test Chat**: Try the chat interface with real AI providers
3. **Create Content**: Add blog posts for SEO
4. **Monitor Usage**: Check the usage dashboard regularly
5. **Optimize Performance**: Run Lighthouse audits and optimize

## Support

If you need help:

- Check the documentation in `docs/`
- Review the spec files in `.kiro/specs/ai-api-management-dashboard/`
- Check the project README.md
- Review error logs in Vercel dashboard

## Maintenance

Regular maintenance tasks:

- [ ] Rotate secrets every 6-12 months
- [ ] Update dependencies monthly
- [ ] Review API usage weekly
- [ ] Check error logs daily
- [ ] Backup database regularly
- [ ] Monitor Core Web Vitals
- [ ] Review security headers

---

**Last Updated**: Task 1.3 - Environment Variables and Security Configuration
