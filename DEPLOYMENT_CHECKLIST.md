# Vercel Deployment Checklist

## Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `wareunder1-max/Futurelinks.ai`
4. Vercel will auto-detect Next.js configuration
5. **DO NOT deploy yet** - we need to set up the database and environment variables first

## Step 2: Add Vercel Postgres Database

1. In your Vercel project, go to the "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Name it: `futurelinks-db`
5. Select region closest to your users
6. Click "Create"
7. Vercel will automatically inject these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` → maps to `DATABASE_URL`
   - `POSTGRES_URL_NON_POOLING` → maps to `DIRECT_URL`

## Step 3: Configure Environment Variables

Go to Settings → Environment Variables and add:

### Required Variables

| Variable | Value | How to Generate |
|----------|-------|-----------------|
| `ENCRYPTION_KEY` | 32-byte hex string | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_SECRET` | Random base64 string | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Use your Vercel deployment URL |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | See Step 4 below |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | See Step 4 below |
| `INITIAL_ADMIN_USERNAME` | `admin` | Or your preferred username |
| `INITIAL_ADMIN_PASSWORD` | Strong password | Change after first login! |

### Important Notes

- ✅ `DATABASE_URL` and `DIRECT_URL` are automatically set by Vercel Postgres
- ⚠️ Generate **NEW** keys for production (don't reuse local development keys)
- ⚠️ Set environment variables for **Production**, **Preview**, and **Development**

## Step 4: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project or create a new one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - Replace `your-domain` with your actual Vercel domain
7. Copy the Client ID and Client Secret
8. Add them to Vercel environment variables

## Step 5: Deploy

1. Go back to your Vercel project
2. Click "Deployments" tab
3. Click "Deploy" or push to your `master` branch
4. Vercel will:
   - Run `npm install`
   - Run `prisma generate`
   - Run `prisma migrate deploy` (applies migrations)
   - Run `next build`
   - Deploy your application

## Step 6: Verify Deployment

After deployment completes:

1. **Check Build Logs**
   - Verify migrations ran successfully
   - Check for any build errors

2. **Test Landing Page**
   - Visit your deployment URL
   - Verify page loads correctly

3. **Test Admin Login**
   - Go to `/admin/login`
   - Log in with `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD`
   - **Immediately change the password** in Admin Management

4. **Add API Keys**
   - In admin dashboard, go to API Keys
   - Add keys for OpenAI, Google Gemini, and/or Anthropic
   - Test each key

5. **Test Chat Interface**
   - Log out of admin (or use incognito)
   - Sign in with Google OAuth
   - Send a test message
   - Verify AI response

6. **Check Monitoring**
   - Go to `/admin/monitoring`
   - Verify metrics are displaying
   - Check Vercel Analytics dashboard

## Step 7: Post-Deployment

1. **Update README**
   - Update deployment URL in README.md
   - Update any hardcoded URLs

2. **Submit Sitemap**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your domain
   - Submit sitemap: `https://your-domain.vercel.app/sitemap.xml`

3. **Set Up Custom Domain** (Optional)
   - In Vercel project settings, go to "Domains"
   - Add your custom domain (e.g., `ai.futurelinks.art`)
   - Update `NEXTAUTH_URL` to use custom domain
   - Update Google OAuth redirect URIs

## Troubleshooting

### Build Fails with Migration Errors
- Check that `DIRECT_URL` is set correctly
- Verify database is accessible from Vercel
- Check migration files are committed to Git

### "Invalid credentials" on Admin Login
- Verify `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` are set
- Check for typos or extra spaces
- Try resetting password via Prisma Studio

### Google OAuth Not Working
- Verify redirect URI matches exactly (no trailing slash)
- Check `NEXTAUTH_URL` matches deployment URL
- Ensure Google OAuth credentials are correct

### API Keys Not Working
- Verify keys are valid in provider dashboards
- Check encryption key is set correctly
- Review Vercel function logs for errors

## Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard
**Google Cloud Console**: https://console.cloud.google.com/
**GitHub Repository**: https://github.com/wareunder1-max/Futurelinks.ai

**Documentation**:
- Full deployment guide: `docs/DEPLOYMENT.md`
- Environment setup: `docs/ENVIRONMENT_SETUP.md`
- Security setup: `docs/SECURITY_SETUP.md`
- Database setup: `docs/DATABASE_SETUP.md`
