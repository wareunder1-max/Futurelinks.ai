# AI FutureLinks Platform - Project Setup

## Overview

This is a Next.js 14+ project with TypeScript, Tailwind CSS, and App Router, configured for the AI FutureLinks Platform.

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.x with strict mode enabled
- **Styling**: Tailwind CSS 4.x
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier

## Configuration Details

### TypeScript

TypeScript is configured with **strict mode enabled** in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

This ensures maximum type safety across the codebase.

### Tailwind CSS Responsive Breakpoints

The project uses custom responsive breakpoints defined in `app/globals.css`:

- **Mobile**: < 768px (default, no prefix needed)
- **Tablet**: 768px - 1024px (use `md:` prefix)
- **Desktop**: > 1024px (use `lg:` prefix)

Example usage:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### ESLint

ESLint is configured with:
- Next.js Core Web Vitals rules
- TypeScript support
- Prettier integration (no conflicts)

Run linting:
```bash
npm run lint
```

### Prettier

Prettier is configured with the following settings:
- Semi-colons: enabled
- Single quotes: enabled
- Print width: 100 characters
- Tab width: 2 spaces
- Trailing commas: ES5 style

Run formatting:
```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
.
├── app/                 # Next.js App Router pages and layouts
│   ├── globals.css     # Global styles with Tailwind imports
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── public/             # Static assets
├── .prettierrc         # Prettier configuration
├── .prettierignore     # Prettier ignore patterns
├── eslint.config.mjs   # ESLint configuration
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Requirements Validation

This setup satisfies the following requirements from the spec:

- **Requirement 17.1**: Next.js 14+ with App Router ✓
- **Requirement 17.2**: TypeScript with strict mode ✓
- **Requirement 16.5**: Tailwind CSS with responsive breakpoints ✓
  - Mobile: < 768px
  - Tablet: 768-1024px
  - Desktop: > 1024px
- **ESLint**: Configured with Next.js best practices ✓
- **Prettier**: Configured for consistent code formatting ✓

## Next Steps

1. Set up Vercel Postgres and Prisma ORM (Task 1.2)
2. Configure environment variables (Task 1.3)
3. Implement encryption utilities (Task 1.4)
4. Set up authentication with NextAuth.js (Task 4.x)

## Notes

- The project uses Tailwind CSS v4 with the new CSS-based configuration
- Custom breakpoints are defined using CSS custom properties in `@theme inline`
- Node.js version 20.9.0+ is recommended for Next.js 16.x (current system has 18.20.8)
