# Database Setup Guide

This guide walks you through setting up Vercel Postgres and running the initial migration for the AI FutureLinks Platform.

## Prerequisites

- Vercel account
- Project deployed to Vercel (or linked locally with `vercel link`)
- Node.js and npm installed

## Step 1: Create Vercel Postgres Database

### Option A: Via Vercel Dashboard

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a database name (e.g., `ai-futurelinks-db`)
6. Select a region (choose closest to your users)
7. Click **Create**

### Option B: Via Vercel CLI

```bash
vercel link  # Link your local project to Vercel
vercel storage create postgres ai-futurelinks-db
```

## Step 2: Configure Environment Variables

After creating the database, Vercel automatically adds these environment variables to your project:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### For Local Development

Pull the environment variables to your local `.env` file:

```bash
vercel env pull .env
```

Then update your `.env` file to map the Vercel variables to Prisma's expected format:

```env
# Use the pooled connection for Prisma Client
DATABASE_URL="${POSTGRES_PRISMA_URL}"

# Use the direct connection for migrations
DIRECT_URL="${POSTGRES_URL_NON_POOLING}"
```

Or manually copy the values:

```env
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

## Step 3: Generate Additional Environment Variables

### Encryption Key

Generate a secure encryption key for API key storage:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:

```env
ENCRYPTION_KEY="your-generated-key-here"
```

### NextAuth Secret

Generate a secret for NextAuth.js:

```bash
openssl rand -base64 32
```

Or:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:

```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # Update for production
```

### Google OAuth (Optional for now)

If you want to set up Google OAuth immediately:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://ai.futurelinks.art/api/auth/callback/google` (production)

Add to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Step 4: Run Initial Migration

### Development Environment

Create and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Generate the Prisma Client

### Production Environment (Vercel)

For production deployments, migrations are applied automatically during the build process. Add this to your `package.json` build script:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Or run manually:

```bash
npx prisma migrate deploy
```

## Step 5: Verify Database Setup

### Check Database Connection

```bash
npx prisma db pull
```

This should show no changes if everything is set up correctly.

### Open Prisma Studio

View and edit your database data:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555`

## Step 6: Seed Initial Data (Optional)

Create an initial admin account by creating `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create initial admin
  const passwordHash = await bcrypt.hash(
    process.env.INITIAL_ADMIN_PASSWORD || 'admin123',
    12
  );

  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: process.env.INITIAL_ADMIN_USERNAME || 'admin',
      passwordHash,
    },
  });

  console.log('Created admin:', admin);

  // Create sample blog post
  const blogPost = await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-ai-futurelinks' },
    update: {},
    create: {
      slug: 'welcome-to-ai-futurelinks',
      title: 'Welcome to AI FutureLinks',
      excerpt: 'Discover the future of AI interaction with our model-agnostic workspace.',
      content: '# Welcome to AI FutureLinks\n\nYour content here...',
      metaDescription: 'Welcome to AI FutureLinks - The model-agnostic AI workspace for the 2026 workflow.',
      keywords: JSON.stringify(['AI', 'workspace', 'multi-model', 'OpenAI', 'Gemini']),
      publishedAt: new Date(),
    },
  });

  console.log('Created blog post:', blogPost);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run the seed:

```bash
npm install -D ts-node bcryptjs @types/bcryptjs
npx prisma db seed
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Verify your `DATABASE_URL` is correct
2. Check that your IP is allowed (Vercel Postgres allows all by default)
3. Ensure SSL mode is set to `require`

### Migration Errors

If migrations fail:

1. Check database permissions
2. Verify `DIRECT_URL` is set correctly (not pooled)
3. Try resetting: `npx prisma migrate reset` (⚠️ deletes all data)

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

```bash
npx prisma generate
```

## Connection Pooling Details

The setup uses two connection strings:

1. **DATABASE_URL** (Pooled via PgBouncer)
   - Used by Prisma Client in application code
   - Optimized for serverless functions
   - Limited connection pool prevents exhaustion
   - Parameter: `pgbouncer=true`

2. **DIRECT_URL** (Direct Connection)
   - Used for migrations and schema operations
   - Bypasses connection pooler
   - Required for DDL operations (CREATE, ALTER, DROP)
   - No `pgbouncer` parameter

This dual-connection approach is essential for Vercel's serverless architecture.

## Next Steps

After completing the database setup:

1. ✅ Database created and connected
2. ✅ Schema migrated
3. ✅ Prisma Client generated
4. ⏭️ Implement authentication (Task 1.3)
5. ⏭️ Build API routes
6. ⏭️ Create UI components

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Next.js Guide](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
