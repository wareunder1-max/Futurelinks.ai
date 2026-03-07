# Quick Start Guide - Database Setup

This is a condensed guide to get the database up and running quickly.

## Prerequisites

- Node.js installed
- Vercel account
- Project linked to Vercel

## 5-Minute Setup

### 1. Create Vercel Postgres Database

```bash
# Link to Vercel (if not already linked)
vercel link

# Create database
vercel storage create postgres ai-futurelinks-db

# Pull environment variables
vercel env pull .env
```

### 2. Update .env File

Open `.env` and ensure these are set:

```env
# Vercel will add these automatically:
DATABASE_URL="${POSTGRES_PRISMA_URL}"
DIRECT_URL="${POSTGRES_URL_NON_POOLING}"

# Generate these:
ENCRYPTION_KEY="run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Migration

```bash
npm run db:migrate -- --name init
```

### 4. Seed Database (Optional)

```bash
npm run db:seed
```

### 5. Verify

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` to view your data.

## Common Commands

```bash
# Development
npm run db:migrate          # Create and apply migration
npm run db:studio           # Open database GUI
npm run db:push             # Push schema changes (no migration)

# Production
npm run db:migrate:deploy   # Apply migrations

# Utilities
npm run db:seed             # Seed data
npm run db:reset            # Reset database (⚠️ deletes all data)
```

## Troubleshooting

### "Can't reach database server"
- Check your `DATABASE_URL` is correct
- Verify Vercel Postgres database is created
- Ensure you're connected to the internet

### "Migration failed"
- Use `DIRECT_URL` for migrations (not pooled)
- Check database permissions
- Try `npm run db:push` for development

### "Prisma Client not found"
- Run `npx prisma generate`
- Check `node_modules/@prisma/client` exists

## Next Steps

After database setup:
1. ✅ Database configured
2. ⏭️ Set up authentication (Task 1.3)
3. ⏭️ Build API routes
4. ⏭️ Create UI components

## Need More Details?

See `docs/DATABASE_SETUP.md` for comprehensive instructions.
