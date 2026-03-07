# AI FutureLinks Platform

A model-agnostic AI interaction workspace that serves as a secure proxy layer between end users and multiple AI providers (OpenAI, Google Gemini, Anthropic). Built with Next.js 14+, TypeScript, Prisma, and NextAuth.js.

## Features

- **Public-Facing Platform**
  - SEO-optimized landing page
  - Google OAuth authentication
  - Real-time AI chat interface
  - Blog system with structured data

- **Admin Dashboard**
  - Secure API key management with AES-256-GCM encryption
  - Usage tracking and analytics
  - Admin account management
  - Session security with automatic timeout

- **Security-First Design**
  - Encrypted API key storage
  - Bcrypt password hashing
  - HTTPS enforcement
  - Secure session management
  - Security headers (CSP, X-Frame-Options, etc.)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Vercel Postgres)
- Google Cloud account (for OAuth)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ai-futurelinks
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the template
   cp .env.local.template .env.local
   
   # Generate secure keys
   npm run env:generate
   
   # Copy the generated keys to .env.local
   # Then configure Google OAuth and database connection
   
   # Verify your configuration
   npm run env:verify
   ```

3. **Set up the database:**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed initial data (creates admin account)
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Landing page: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin
   - Login with credentials from `.env.local`

## Documentation

Comprehensive setup guides are available in the `docs/` directory:

### Local Development
- **[Environment Setup Guide](docs/ENVIRONMENT_SETUP.md)** - Detailed configuration instructions
- **[Security Setup Guide](docs/SECURITY_SETUP.md)** - Encryption, OAuth, and security best practices
- **[Database Setup Guide](docs/DATABASE_SETUP.md)** - Prisma schema and migrations
- **[Quick Start Guide](docs/QUICK_START.md)** - Fast-track setup instructions

### Deployment
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment guide with environment setup, migrations, and API key configuration
- **[Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)** - Comprehensive Vercel deployment instructions
- **[Vercel Environment Variables Checklist](docs/VERCEL_ENV_CHECKLIST.md)** - Quick reference for env vars
- **[Setup Checklist](docs/SETUP_CHECKLIST.md)** - Step-by-step setup verification

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes to database
- `npm run db:reset` - Reset database (WARNING: deletes all data)

### Environment
- `npm run env:generate` - Generate secure encryption keys
- `npm run env:verify` - Verify environment configuration
- `npm run setup` - Complete setup (verify + migrate + seed)

## Environment Variables

Required environment variables (see `.env.local.template` for details):

```env
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Security
ENCRYPTION_KEY="<32-byte-hex>"
NEXTAUTH_SECRET="<random-secret>"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="<your-client-id>"
GOOGLE_CLIENT_SECRET="<your-client-secret>"

# Initial Admin
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="<secure-password>"
```

Generate secure keys with:
```bash
npm run env:generate
```

## Project Structure

```
ai-futurelinks/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── blog/              # Blog pages
│   └── chat/              # Chat interface
├── components/            # React components
├── lib/                   # Utility functions
│   ├── encryption.ts      # API key encryption
│   ├── auth.ts           # Password hashing
│   └── seo/              # SEO utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seed script
├── scripts/              # Utility scripts
│   ├── generate-keys.js  # Generate encryption keys
│   └── verify-env.js     # Verify environment setup
├── docs/                 # Documentation
└── public/               # Static assets
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Security

This platform implements multiple security layers:

- **Encryption**: AES-256-GCM for API keys
- **Hashing**: Bcrypt (12 rounds) for passwords
- **Sessions**: JWT-based with 30-minute timeout for admins
- **Transport**: HTTPS enforcement
- **Headers**: CSP, X-Frame-Options, HSTS, etc.

See [Security Setup Guide](docs/SECURITY_SETUP.md) for details.

## Deployment

### Vercel (Recommended)

The platform is optimized for deployment on Vercel with automatic configuration via `vercel.json`.

**Quick Deployment Steps:**

1. **Connect your repository to Vercel**
   - Import your GitHub repository in Vercel dashboard
   - Vercel automatically detects Next.js configuration

2. **Add Vercel Postgres database**
   - Go to Storage tab in Vercel dashboard
   - Create new Postgres database
   - Connection strings are automatically injected

3. **Configure environment variables**
   - See [Vercel Environment Variables Checklist](docs/VERCEL_ENV_CHECKLIST.md)
   - Generate new keys for production (never reuse development keys!)
   - Set up Google OAuth with production redirect URIs

4. **Deploy**
   - Push to main branch for automatic deployment
   - Or use `vercel --prod` for manual deployment

**Comprehensive Guides:**
- **[Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)** - Complete deployment instructions
- **[Vercel Environment Variables Checklist](docs/VERCEL_ENV_CHECKLIST.md)** - Quick reference for env vars
- **[Setup Checklist](docs/SETUP_CHECKLIST.md)** - Step-by-step verification

**Key Features:**
- ✅ Automatic HTTPS with security headers
- ✅ Edge functions for API routes (30s timeout, 1GB memory)
- ✅ Optimized caching for static assets
- ✅ Connection pooling for Vercel Postgres
- ✅ Automatic scaling based on demand

## Development

### Running Tests
```bash
npm test                    # Run all tests
npm run test:unit          # Run unit tests
npm run test:integration   # Run integration tests
npm run test:e2e          # Run end-to-end tests
```

### Code Quality
```bash
npm run lint              # Check for linting errors
npm run format            # Format code
npm run format:check      # Check formatting
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Check the [documentation](docs/)
- Review the [spec files](.kiro/specs/ai-api-management-dashboard/)
- Open an issue on GitHub

---

Built with ❤️ using Next.js and Vercel
