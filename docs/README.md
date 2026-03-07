# Documentation

Essential guides for deploying and operating the AI FutureLinks Platform.

## Quick Links

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with environment setup, migrations, and verification
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Detailed environment variable configuration
- **[SECURITY_SETUP.md](./SECURITY_SETUP.md)** - Security configuration and best practices
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup and migration guide

## For Developers

For technical architecture and implementation details, see:
- **Design Document**: `.kiro/specs/ai-api-management-dashboard/design.md`
- **Requirements**: `.kiro/specs/ai-api-management-dashboard/requirements.md`
- **Main README**: `../README.md`

## Quick Start

1. Set up environment variables (see ENVIRONMENT_SETUP.md)
2. Run database migrations: `npm run db:migrate`
3. Seed initial data: `npm run db:seed`
4. Deploy to Vercel (see DEPLOYMENT.md)
