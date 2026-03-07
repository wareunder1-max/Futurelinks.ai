# Prisma Database Setup

This directory contains the Prisma schema and migration files for the AI FutureLinks Platform.

## Database Schema

The schema includes the following models:

- **User**: Public users who authenticate and use the chat interface
- **ChatSession**: Chat sessions associated with users
- **Message**: Individual messages within chat sessions
- **APIKey**: Encrypted API keys for external AI providers (OpenAI, Gemini, Anthropic)
- **UsageLog**: Usage metrics for API key consumption tracking
- **Admin**: Administrator accounts for the admin dashboard
- **BlogPost**: SEO-optimized blog posts for the public website

## Connection Pooling

The schema is configured for Vercel Postgres with connection pooling:

- `DATABASE_URL`: Uses PgBouncer for connection pooling (serverless functions)
- `DIRECT_URL`: Direct connection for migrations and schema operations

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

For Vercel deployment, the `DATABASE_URL` and `DIRECT_URL` will be automatically populated when you connect a Vercel Postgres database.

### 2. Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma Client based on your schema.

### 3. Run Migrations

For development:

```bash
npx prisma migrate dev --name init
```

For production (Vercel):

```bash
npx prisma migrate deploy
```

### 4. Seed Database (Optional)

Create a seed script in `prisma/seed.ts` to populate initial data:

```bash
npx prisma db seed
```

## Vercel Postgres Setup

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Vercel will automatically set the `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, and other environment variables
5. Map these to your `.env` file:
   - `DATABASE_URL` = `POSTGRES_PRISMA_URL` (pooled connection)
   - `DIRECT_URL` = `POSTGRES_URL_NON_POOLING` (direct connection)

## Common Commands

- `npx prisma studio`: Open Prisma Studio to view/edit data
- `npx prisma db push`: Push schema changes without creating migrations (dev only)
- `npx prisma db pull`: Pull schema from existing database
- `npx prisma migrate reset`: Reset database and run all migrations
- `npx prisma format`: Format the schema file

## Security Notes

- API keys are stored encrypted using AES-256-GCM
- Admin passwords are hashed using bcrypt
- Never commit `.env` file to version control
- Use environment variables for all sensitive data

## Indexes

The schema includes indexes on frequently queried fields:

- User: email
- ChatSession: userId
- Message: sessionId, apiKeyUsed
- APIKey: provider
- UsageLog: apiKeyId, timestamp
- Admin: username
- BlogPost: slug, publishedAt

These indexes optimize query performance for common operations.
