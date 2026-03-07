# Implementation Plan: AI FutureLinks Platform

## Overview

This implementation plan breaks down the AI FutureLinks Platform into incremental, testable steps. The platform is built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, NextAuth.js, Prisma ORM, and Vercel Postgres. Each task builds on previous work, with property-based tests (using fast-check) integrated throughout to validate correctness properties early.

## Tasks

- [x] 1. Project setup and infrastructure
  - [x] 1.1 Initialize Next.js 14+ project with TypeScript and App Router
    - Create Next.js project with `create-next-app`
    - Configure TypeScript with strict mode
    - Set up Tailwind CSS with responsive breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px)
    - Configure ESLint and Prettier
    - _Requirements: 17.1, 17.2, 16.5_

  - [x] 1.2 Set up Vercel Postgres and Prisma ORM
    - Install Prisma and initialize with Vercel Postgres provider
    - Create Prisma schema with all models (User, ChatSession, Message, APIKey, UsageLog, Admin, BlogPost)
    - Configure connection pooling
    - Run initial migration
    - _Requirements: 17.4, 10.1_

  - [x] 1.3 Configure environment variables and security
    - Create `.env.local` template with all required variables
    - Set up ENCRYPTION_KEY for API key encryption (32-byte hex)
    - Configure NEXTAUTH_SECRET and NEXTAUTH_URL
    - Set up Google OAuth credentials
    - _Requirements: 13.1, 13.2, 13.7_

  - [x] 1.4 Implement encryption utilities
    - Create `lib/encryption.ts` with AES-256-GCM encryption functions
    - Implement `encryptAPIKey()` and `decryptAPIKey()` functions
    - _Requirements: 10.2_

  - [ ]* 1.5 Write property test for encryption round trip
    - **Property 30: API Key Retrieval Round Trip**
    - **Validates: Requirements 10.4, 10.5**

  - [x] 1.6 Implement password hashing utilities
    - Create `lib/auth.ts` with bcrypt hashing functions (12 salt rounds)
    - Implement `hashPassword()` and `verifyPassword()` functions
    - _Requirements: 7.7, 12.6_

  - [ ]* 1.7 Write property test for password hashing
    - **Property 34: Password Hashing at Rest**
    - **Validates: Requirements 12.6**

  - [x] 1.8 Configure security headers middleware
    - Create `middleware.ts` with security headers (CSP, X-Frame-Options, X-Content-Type-Options)
    - Implement HTTPS redirect logic
    - _Requirements: 13.1, 13.2, 13.7_

  - [ ]* 1.9 Write property test for secure headers
    - **Property 35: Secure Headers Present**
    - **Validates: Requirements 13.7**

- [x] 2. Checkpoint - Verify infrastructure setup
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Database models and seed data
  - [x] 3.1 Create database seed script
    - Create `prisma/seed.ts` with initial admin account creation
    - Use INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD from env
    - Hash admin password before storage
    - _Requirements: 7.7, 12.6_

  - [x] 3.2 Create sample blog posts
    - Add 3-5 sample blog posts to seed script with SEO-optimized content
    - Include proper slugs, meta descriptions, and keywords
    - _Requirements: 5.1, 5.2, 6.2_

  - [x] 3.3 Run database seed
    - Execute `prisma db seed` to populate initial data
    - Verify admin account and blog posts created
    - _Requirements: 7.7_

- [x] 4. Authentication systems
  - [x] 4.1 Configure NextAuth.js for public user authentication
    - Create `app/api/auth/[...nextauth]/route.ts`
    - Configure Google OAuth provider
    - Configure Email provider (magic links)
    - Set up JWT session strategy
    - Implement session callbacks to attach user role
    - _Requirements: 2.1, 2.2, 2.6_

  - [x] 4.2 Create AuthProvider component
    - Create `components/auth/AuthProvider.tsx` wrapping SessionProvider
    - Add to root layout for client-side session access
    - _Requirements: 2.6_

  - [x] 4.3 Create SignIn component
    - Create `components/auth/SignIn.tsx` with Google OAuth button
    - Add email authentication form
    - Implement error state handling
    - Style with Tailwind CSS
    - _Requirements: 2.1, 2.5_

  - [ ]* 4.4 Write property tests for public authentication
    - **Property 1: Successful Authentication Creates Session**
    - **Property 2: Failed Authentication Shows Error**
    - **Property 3: Logout Terminates Session**
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.7**

  - [x] 4.5 Configure admin authentication with Credentials provider
    - Add CredentialsProvider to NextAuth config for admin login
    - Implement authorize function querying Admin table
    - Verify password with bcrypt
    - Set admin role in JWT token
    - Configure 30-minute session timeout for admins
    - _Requirements: 7.1, 7.2, 7.3, 14.1_

  - [ ]* 4.6 Write property tests for admin authentication
    - **Property 20: Admin Authentication Creates Admin Session**
    - **Property 21: Invalid Admin Credentials Rejected**
    - **Property 22: Admin Session Termination Revokes Access**
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**

  - [x] 4.7 Implement admin session timeout logic
    - Create session extension middleware for admin routes
    - Implement automatic logout after 30 minutes inactivity
    - Add timeout notification redirect
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 4.8 Write property tests for admin session security
    - **Property 36: Admin Session Timeout**
    - **Property 37: Admin Session Activity Extension**
    - **Property 38: Admin Session Token Validation**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

- [x] 5. Checkpoint - Verify authentication systems
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Public-facing features
  - [x] 6.1 Create landing page
    - Create `app/page.tsx` as server component
    - Implement hero section with h1 "The Evolution of the Interface"
    - Add h2 subheadline with platform description
    - Include body copy with SEO keywords
    - Add CTA button linking to /chat
    - Add navigation to /blog and authentication
    - Style with Tailwind CSS for responsive design
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 1.9_

  - [ ]* 6.2 Write property tests for landing page SEO
    - **Property 15: Public Page HTML Validity**
    - **Property 16: Meta Description Presence**
    - **Property 17: Open Graph Tags**
    - **Property 19: Heading Hierarchy Correctness**
    - **Property 42: SEO Keyword Presence**
    - **Validates: Requirements 1.2, 1.3, 1.5, 1.6, 6.1, 6.2, 6.3, 6.7**

  - [x] 6.3 Create blog list page
    - Create `app/blog/page.tsx` with static generation
    - Query BlogPost table via Prisma
    - Display list of posts with titles and excerpts
    - Implement pagination for >10 posts
    - Style with Tailwind CSS
    - _Requirements: 5.1, 5.2, 5.6_

  - [x] 6.4 Create blog post detail page
    - Create `app/blog/[slug]/page.tsx` with dynamic routes
    - Implement `generateStaticParams` for build-time generation
    - Query single post by slug
    - Render markdown content
    - Add SEO meta tags (title, description, keywords)
    - Implement semantic HTML (article, header, section)
    - Add social sharing buttons
    - _Requirements: 5.3, 5.4, 5.5, 6.6_

  - [ ]* 6.5 Write property tests for blog system
    - **Property 11: Blog Post Display Completeness**
    - **Property 12: Blog Post SEO Meta Tags**
    - **Property 13: Blog Post Semantic HTML**
    - **Property 14: Blog Pagination Threshold**
    - **Property 18: Descriptive Blog URLs**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 6.6**

  - [x] 6.6 Create chat interface page
    - Create `app/chat/page.tsx` with session protection
    - Implement redirect to /api/auth/signin if not authenticated
    - Create message display area with auto-scroll
    - Create multi-line textarea input
    - Add send button
    - Implement loading state during API calls
    - Style with Tailwind CSS for responsive design (mobile touch targets 44x44px)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 16.6_

  - [ ]* 6.7 Write property tests for chat interface access
    - **Property 4: Active Session Grants Chat Access**
    - **Property 5: Unauthenticated Chat Access Redirects**
    - **Property 41: Mobile Touch Target Sizing**
    - **Validates: Requirements 3.1, 3.5, 16.6**

  - [x] 6.8 Implement chat state management
    - Create `hooks/useChat.ts` custom hook
    - Manage messages array, loading state, error state
    - Implement message submission logic
    - Handle streaming responses with Server-Sent Events
    - _Requirements: 4.1, 4.4_

  - [x] 6.9 Generate sitemap.xml and robots.txt
    - Create `app/sitemap.ts` generating sitemap for all public pages
    - Create `app/robots.ts` with crawler guidelines
    - _Requirements: 6.4, 6.5_

- [x] 7. SEO and AI search optimization
  - [x] 7.1 Create JSON-LD structured data component
    - Create `components/seo/JsonLd.tsx` component for embedding JSON-LD scripts
    - Implement type-safe props for different schema types
    - Ensure proper JSON escaping and script tag generation
    - _Requirements: 18.1, 18.8_

  - [x] 7.2 Implement Schema.org generators
    - Create `lib/seo/schemas.ts` with schema generator functions
    - Implement `generateOrganizationSchema()` with name, url, logo, description
    - Implement `generateWebSiteSchema()` with name, url, potentialAction search
    - Implement `generateBlogPostingSchema()` with headline, author, dates, image, articleBody
    - Implement `generateBreadcrumbListSchema()` for navigation hierarchy
    - Implement `generateFAQPageSchema()` with mainEntity question-answer pairs
    - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6_

  - [ ]* 7.3 Write property tests for JSON-LD schemas
    - **Property 43: JSON-LD Schema Validity**
    - **Property 44: Blog Post Schema Completeness**
    - **Property 45: JSON-LD Head Placement**
    - **Property 46: Breadcrumb Schema Presence**
    - **Property 47: FAQ Schema Structure**
    - **Validates: Requirements 18.1, 18.4, 18.5, 18.6, 18.7, 18.8**

  - [x] 7.4 Integrate JSON-LD into landing page
    - Add Organization schema to landing page
    - Add WebSite schema with search action
    - Embed schemas in head section using JsonLd component
    - _Requirements: 18.2, 18.3_

  - [x] 7.5 Integrate JSON-LD into blog pages
    - Add BlogPosting schema to blog post detail page
    - Add BreadcrumbList schema to blog post detail page
    - Include all required properties (headline, author, dates, image, articleBody)
    - _Requirements: 18.4, 18.6_

  - [x] 7.6 Update robots.txt with AI crawler directives
    - Update `app/robots.ts` to include AI crawler user-agents
    - Add allow directives for GPTBot, Google-Extended, ClaudeBot, CCBot, anthropic-ai
    - Configure crawl-delay and sitemap reference
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.7_

  - [ ]* 7.7 Write property test for AI crawler access
    - **Property 48: AI Crawler Robots Access**
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.7**

  - [x] 7.8 Implement canonical URLs
    - Add canonical link tags to all public pages
    - Create `lib/seo/canonical.ts` utility for generating canonical URLs
    - Ensure canonical URLs point to authoritative versions
    - _Requirements: 19.8, 6.12_

  - [x] 7.9 Add AI-specific meta tags
    - Implement ai-content-declaration meta tags
    - Add to all public pages for AI crawler guidance
    - _Requirements: 19.6_

  - [ ]* 7.10 Write property test for canonical URLs
    - **Property 49: Canonical URL Presence**
    - **Validates: Requirements 19.8, 6.12**

  - [x] 7.11 Create meta tag generator utility
    - Create `lib/seo/meta.ts` with meta tag generation functions
    - Implement `generateMetaTags()` for title, description, keywords
    - Implement `generateOpenGraphTags()` for social sharing
    - Implement `generateTwitterCardTags()` for Twitter
    - Validate tag length constraints (title 50-60 chars, description 150-160 chars)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 7.12 Enhance blog post structure with semantic HTML
    - Update blog post template to use article, section elements
    - Implement proper heading hierarchy (h2, h3, h4) without skipping levels
    - Add author attribution and publication dates
    - Implement definition lists (dl, dt, dd) for term definitions
    - Add properly formatted code blocks with language specification
    - Implement comparison tables with descriptive headers
    - Add blockquote elements with citation attributes
    - _Requirements: 20.1, 20.3, 20.4, 20.5, 20.6, 23.1, 23.2, 23.3, 23.5, 23.6, 23.7, 23.8_

  - [ ]* 7.13 Write property tests for content structure
    - **Property 50: Blog Heading Hierarchy**
    - **Property 51: Image Alt Text Presence**
    - **Property 52: Blog Semantic HTML**
    - **Property 53: Section Semantic HTML**
    - **Property 54: FAQ Structure**
    - **Property 67: Blog Post Structure**
    - **Property 68: Blog Author Metadata**
    - **Property 69: Blog Date Metadata**
    - **Property 70: Definition List Markup**
    - **Property 71: Code Block Formatting**
    - **Property 72: Comparison Table Structure**
    - **Property 73: Blockquote Citation**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.6, 23.1, 23.2, 23.3, 23.5, 23.6, 23.7, 23.8, 6.13**

  - [x] 7.14 Configure Next.js Image optimization
    - Update `next.config.js` to enable image optimization
    - Configure WebP and AVIF format support
    - Set up image quality and size optimization
    - Implement fallbacks for older browsers
    - _Requirements: 21.9_

  - [ ]* 7.15 Write property test for modern image formats
    - **Property 60: Modern Image Formats**
    - **Validates: Requirements 21.9**

  - [x] 7.16 Implement LCP optimization
    - Add priority attribute to hero images on landing page
    - Implement preload hints for critical images
    - Optimize image sizes and formats for fastest loading
    - Target LCP < 2.5 seconds
    - _Requirements: 21.1, 21.8_

  - [x] 7.17 Implement FID optimization
    - Configure code splitting for JavaScript bundles
    - Implement dynamic imports for non-critical components
    - Minimize main thread blocking
    - Target FID < 100 milliseconds
    - _Requirements: 21.2_

  - [x] 7.18 Implement CLS optimization
    - Add skeleton loaders for dynamic content
    - Implement font-display: swap for web fonts
    - Reserve space for images with width/height attributes
    - Target CLS < 0.1
    - _Requirements: 21.3, 21.6_

  - [ ]* 7.19 Write property tests for Core Web Vitals
    - **Property 55: Core Web Vitals - FID Threshold**
    - **Property 56: Core Web Vitals - CLS Threshold**
    - **Property 57: Lazy Loading Below Fold**
    - **Property 58: Font Display Swap**
    - **Property 59: Resource Hints for Critical Assets**
    - **Validates: Requirements 21.2, 21.3, 21.4, 21.6, 21.8**

  - [x] 7.20 Implement mobile-first CSS with Tailwind
    - Configure Tailwind with mobile-first breakpoints
    - Write base styles for mobile viewports
    - Add responsive classes for tablet and desktop
    - Ensure no horizontal scrolling on mobile
    - Set base font size to 16px minimum
    - _Requirements: 22.1, 22.5, 22.6_

  - [x] 7.21 Configure viewport meta tags
    - Add viewport meta tag to root layout
    - Set width=device-width and initial-scale=1
    - _Requirements: 22.3_

  - [x] 7.22 Ensure touch target sizing
    - Audit all interactive elements for 44x44px minimum size
    - Update button and link styles for mobile touch targets
    - Test on mobile viewports
    - _Requirements: 22.4, 16.6_

  - [ ]* 7.23 Write property tests for mobile optimization
    - **Property 61: Mobile-First CSS**
    - **Property 62: Mobile Page Load Time**
    - **Property 63: Viewport Meta Tag**
    - **Property 64: Mobile Touch Target Size**
    - **Property 65: No Horizontal Scroll on Mobile**
    - **Property 66: Mobile Font Size**
    - **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 16.6**

- [x] 8. Checkpoint - Verify SEO and mobile optimization
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. API proxy layer
  - [x] 9.1 Create AI proxy API route
    - Create `app/api/proxy/route.ts` with POST handler
    - Validate user session with NextAuth
    - Parse request body (message, conversationHistory, model)
    - _Requirements: 4.1, 13.6_

  - [x] 9.2 Implement API key selection logic
    - Query APIKey table for available keys
    - Select key based on provider (default to first available)
    - Handle case when no keys available (503 error)
    - _Requirements: 4.2_

  - [x] 9.3 Implement provider-specific request transformation
    - Create `lib/providers/openai.ts` with OpenAI API format
    - Create `lib/providers/gemini.ts` with Gemini API format
    - Create `lib/providers/anthropic.ts` with Anthropic API format
    - Transform user message to provider-specific format
    - _Requirements: 4.3_

  - [x] 9.4 Implement streaming response handling
    - Forward request to external AI provider
    - Stream response back to client using Server-Sent Events
    - Handle provider errors gracefully
    - Implement 10-second timeout
    - _Requirements: 4.4, 4.5, 4.6_

  - [ ]* 9.5 Write property tests for proxy layer
    - **Property 6: Message Submission Creates Proxy Request**
    - **Property 7: Proxy Request Selects API Key**
    - **Property 8: API Response Display**
    - **Property 9: API Failure Error Handling**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [x] 9.6 Implement usage tracking
    - Create UsageLog entry after each proxy request
    - Record apiKeyId, timestamp, tokensUsed, requestDuration
    - Update APIKey.lastUsedAt field
    - _Requirements: 4.7, 11.1_

  - [ ]* 9.7 Write property test for usage tracking
    - **Property 10: Usage Metrics Recorded Per Request**
    - **Validates: Requirements 4.7, 11.1**

  - [x] 9.8 Implement error response format
    - Create `lib/errors.ts` with ErrorResponse interface
    - Implement consistent error formatting for all API routes
    - Add error logging with context
    - _Requirements: 4.5_

- [x] 10. Checkpoint - Verify API proxy layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Admin dashboard features
  - [x] 11.1 Create admin login page
    - Create `app/admin/login/page.tsx`
    - Implement username/password form
    - Call NextAuth signIn with credentials provider
    - Handle error states
    - Redirect to /admin/keys on success
    - Style with Tailwind CSS
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 11.2 Create admin layout with navigation
    - Create `app/admin/layout.tsx` with session protection
    - Redirect to /admin/login if no admin session
    - Add navigation menu (API Keys, Usage, Admins)
    - Add logout button
    - _Requirements: 7.5, 7.6_

  - [x] 11.3 Create API key management page
    - Create `app/admin/keys/page.tsx`
    - Display list of all API keys (masked display)
    - Show provider, created date, last used date
    - Add "Add New Key" button
    - _Requirements: 8.1, 9.1_

  - [x] 11.4 Implement API key creation form
    - Create modal/form component for adding new key
    - Add provider dropdown (OpenAI, Gemini, Anthropic)
    - Add credential string input
    - Validate non-empty fields
    - Call API route to save key
    - Display confirmation message
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 11.5 Write property tests for API key creation
    - **Property 23: API Key Addition Validation**
    - **Property 24: API Key Addition Persistence**
    - **Property 28: API Key Encryption at Rest**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.6, 10.2**

  - [x] 11.6 Implement API key editing functionality
    - Add edit button for each key in list
    - Display edit modal with current values (masked)
    - Allow modification of provider and credential
    - Call API route to update key
    - Display confirmation message
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 11.7 Write property tests for API key updates
    - **Property 26: API Key Selection Shows Details**
    - **Property 27: API Key Update Persistence**
    - **Validates: Requirements 9.2, 9.5, 9.6**

  - [x] 11.8 Implement API key deletion functionality
    - Add delete button for each key
    - Display confirmation dialog
    - Call API route to delete key (cascade to UsageLog)
    - Display confirmation message
    - _Requirements: 15.1, 15.2, 15.3, 15.5_

  - [ ]* 11.9 Write property tests for API key deletion
    - **Property 39: API Key Deletion Confirmation**
    - **Property 40: API Key Deletion Cascade**
    - **Validates: Requirements 15.2, 15.3, 15.4, 15.5**

  - [x] 11.10 Create API routes for API key CRUD
    - Create `app/api/admin/keys/route.ts` with GET, POST handlers
    - Create `app/api/admin/keys/[id]/route.ts` with PUT, DELETE handlers
    - Validate admin session on all routes
    - Encrypt keys before storage, decrypt on retrieval
    - Handle storage failures with error messages
    - _Requirements: 8.4, 9.5, 10.1, 10.2, 10.3_

  - [ ]* 11.11 Write property test for storage error handling
    - **Property 29: Storage Failure Error Handling**
    - **Validates: Requirements 10.3**

  - [x] 11.12 Create usage dashboard page
    - Create `app/admin/usage/page.tsx`
    - Query UsageLog with aggregation by apiKeyId
    - Display table with columns: Provider, Total Requests, Last Used
    - Implement sortable columns
    - Add date range filtering
    - Implement polling for real-time updates (5 seconds)
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [ ]* 11.13 Write property test for usage metrics display
    - **Property 31: Usage Metrics Display**
    - **Validates: Requirements 11.2, 11.3, 11.4**

  - [x] 11.14 Create usage API route
    - Create `app/api/admin/usage/route.ts` with GET handler
    - Validate admin session
    - Query UsageLog with optional date filters
    - Aggregate metrics by API key
    - Return formatted data
    - _Requirements: 11.2, 11.5, 11.6_

  - [x] 11.15 Create admin management page
    - Create `app/admin/admins/page.tsx`
    - Display list of admin accounts
    - Add "Create Admin" button
    - Add password change form for current admin
    - _Requirements: 12.1, 12.2_

  - [x] 11.16 Implement admin account creation
    - Create form for new admin (username, password)
    - Validate username uniqueness
    - Validate password length (min 8 characters)
    - Call API route to create admin
    - Hash password before storage
    - Display confirmation message
    - _Requirements: 12.2, 12.3, 12.4, 12.6, 12.7_

  - [ ]* 11.17 Write property tests for admin management
    - **Property 32: Admin Account Creation Uniqueness**
    - **Property 33: Password Strength Validation**
    - **Validates: Requirements 12.3, 12.4, 12.7**

  - [x] 11.18 Create admin CRUD API routes
    - Create `app/api/admin/admins/route.ts` with GET, POST handlers
    - Create `app/api/admin/admins/[id]/route.ts` with PUT handler
    - Validate admin session on all routes
    - Hash passwords before storage
    - Validate username uniqueness
    - Validate password strength
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 12. Checkpoint - Verify admin dashboard
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Testing implementation
  - [x] 13.1 Set up testing framework
    - Install Vitest, React Testing Library, fast-check
    - Configure `vitest.config.ts` with test environment
    - Set up test database with in-memory SQLite
    - Create test utilities and helpers
    - _Requirements: All_

  - [x] 13.2 Create custom fast-check generators
    - Create `tests/generators.ts` with domain-specific generators
    - Implement apiKeyGenerator, blogPostGenerator, userCredentialsGenerator
    - Implement messageGenerator, usageMetricsGenerator
    - _Requirements: All_

  - [x]* 13.3 Implement all property-based tests
    - Create test files in `tests/property/` directory
    - Implement all 73 property tests with 100 iterations each
    - Add property number and requirement references in comments
    - Configure seed-based reproducibility
    - _Requirements: All_

  - [x] 13.4 Write unit tests for components
    - Test landing page rendering (h1, h2, keywords)
    - Test chat interface message display
    - Test admin dashboard forms
    - Test responsive breakpoints
    - _Requirements: 1.2, 1.3, 3.2, 3.3, 16.1, 16.2, 16.3_

  - [x] 13.5 Write unit tests for API routes
    - Test authentication endpoints
    - Test proxy endpoint request forwarding
    - Test admin endpoints session validation
    - Test error response format
    - _Requirements: 2.3, 4.1, 7.3, 13.4, 13.5_

  - [x] 13.6 Write integration tests
    - Test complete authentication flow (OAuth → session → chat)
    - Test complete chat flow (message → proxy → response → usage)
    - Test complete admin flow (login → add key → view usage → delete)
    - _Requirements: 2.3, 2.4, 4.1, 4.4, 7.3, 8.4_

- [x] 14. Checkpoint - Verify all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Deployment and optimization
  - [x] 15.1 Configure Vercel deployment
    - Create `vercel.json` with build configuration
    - Configure environment variables in Vercel dashboard
    - Set up Vercel Postgres connection
    - Configure edge functions for API routes
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [x] 15.2 Optimize static assets
    - Configure Next.js image optimization
    - Set up CDN caching headers
    - Implement code splitting
    - Optimize bundle size
    - _Requirements: 17.3_

  - [x] 15.3 Implement performance optimizations
    - Add React Server Components where appropriate
    - Implement streaming for chat responses
    - Optimize database queries with indexes
    - Add connection pooling configuration
    - _Requirements: 1.10, 4.6_

  - [x] 15.4 Run Lighthouse audit
    - Test landing page performance (target >90)
    - Test SEO score (target >90)
    - Test accessibility score
    - Fix any identified issues
    - _Requirements: 1.10, 6.1, 6.2, 6.3_

  - [x] 15.5 Set up monitoring and error tracking
    - Configure Vercel Analytics
    - Set up error logging service (Sentry or similar)
    - Implement API usage metrics dashboard
    - Configure alerts for error rates and performance
    - _Requirements: 11.1, 11.5_

  - [x] 15.6 Create deployment documentation
    - Document environment variable setup
    - Document database migration process
    - Document initial admin account creation
    - Document API key configuration
    - _Requirements: 7.7, 8.4, 17.4_

- [x] 16. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- All 73 correctness properties from the design document are covered
- The implementation follows Next.js 14+ App Router patterns with TypeScript
- Security is prioritized throughout (encryption, hashing, HTTPS, session management)
- The platform is optimized for Vercel deployment with serverless architecture
- SEO and AI search optimization tasks include JSON-LD structured data, AI crawler configuration, Core Web Vitals optimization, and mobile-first responsive design
