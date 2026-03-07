# NextAuth.js v5 Authentication Configuration

This directory contains the NextAuth.js v5 authentication setup for the AI FutureLinks Platform.

## Overview

The platform supports three authentication methods:

1. **Google OAuth** - For public users
2. **Email Magic Links** - For public users (via Resend)
3. **Credentials (Username/Password)** - For admin users only

## Architecture

### Files

- `[...nextauth]/route.ts` - API route handler for all NextAuth requests
- `lib/auth.config.ts` - NextAuth configuration with providers and callbacks
- `lib/auth-setup.ts` - NextAuth instance setup and exports
- `types/next-auth.d.ts` - TypeScript type extensions for custom fields

### Session Strategy

- **Strategy**: JWT (JSON Web Tokens)
- **Max Age**: 30 minutes (configurable per user type)
- **Storage**: Tokens are stored in HTTP-only cookies

### User Roles

The platform distinguishes between two user roles:

- `public` - Regular users who access the chat interface
- `admin` - Administrators who access the admin dashboard

The role is attached to the JWT token and session object for authorization checks.

## Configuration

### Environment Variables

Required environment variables (see `.env.local.template`):

```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Email Provider (Resend)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@futurelinks.art"

# Admin Credentials (for seeding)
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="change-this-password"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://ai.futurelinks.art/api/auth/callback/google`
4. Copy the Client ID and Client Secret to your `.env.local`

### Resend Email Setup

1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Verify your sending domain
4. Add the API key to your `.env.local`

## Authentication Flow

### Public User Authentication (Google)

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth creates/updates User record in database
6. JWT token created with `role: 'public'`
7. User redirected to `/chat`

### Public User Authentication (Email)

1. User enters email address
2. Magic link sent to email via Resend
3. User clicks link in email
4. NextAuth verifies token
5. User record created/updated in database
6. JWT token created with `role: 'public'`
7. User redirected to `/chat`

### Admin Authentication (Credentials)

1. Admin enters username and password at `/admin/login`
2. NextAuth queries Admin table in database
3. Password verified using bcrypt
4. JWT token created with `role: 'admin'`
5. Admin redirected to `/admin/keys`

## Callbacks

### JWT Callback

Runs when a JWT is created or updated. Responsibilities:

- Add user ID and role to token
- Create/update User record for public users
- Update last login timestamp

### Session Callback

Runs when a session is checked. Responsibilities:

- Attach user ID and role to session object
- Make role available to client-side code

### Redirect Callback

Controls post-authentication redirects:

- Admins → `/admin/keys`
- Public users → `/chat`

## Usage in Code

### Server Components

```typescript
import { auth } from '@/lib/auth-setup';

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Check role
  if (session.user.role === 'admin') {
    // Admin-only logic
  }
  
  return <div>Hello {session.user.name}</div>;
}
```

### Client Components

```typescript
'use client';
import { useSession } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user.name}</div>;
}
```

### API Routes

```typescript
import { auth } from '@/lib/auth-setup';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check role
  if (session.user.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Admin-only logic
  return Response.json({ data: 'secret' });
}
```

### Middleware

```typescript
import { auth } from '@/lib/auth-setup';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const session = req.auth;
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  
  // Protect chat routes
  if (req.nextUrl.pathname.startsWith('/chat')) {
    if (!session) {
      return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/chat/:path*'],
};
```

## Security Features

### Password Hashing

Admin passwords are hashed using bcrypt with 12 salt rounds before storage.

### CSRF Protection

NextAuth includes built-in CSRF protection for all authentication requests.

### HTTP-Only Cookies

Session tokens are stored in HTTP-only cookies, preventing XSS attacks.

### Secure Cookies

In production (HTTPS), cookies are marked as secure.

### SameSite Cookies

Cookies use SameSite=Lax to prevent CSRF attacks.

## Session Management

### Session Timeout

- Admin sessions: 30 minutes of inactivity
- Public user sessions: Configurable (default: 30 days)

### Session Extension

Sessions are automatically extended on user activity.

### Manual Sign Out

Users can sign out manually, which invalidates the JWT token.

## Database Schema

### User Table

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  provider    String   // 'google' | 'email'
  createdAt   DateTime @default(now())
  lastLoginAt DateTime @default(now())
}
```

### Admin Table

```prisma
model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  lastLoginAt  DateTime @default(now())
}
```

## Troubleshooting

### "Invalid credentials" error

- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Verify redirect URIs in Google Cloud Console match your environment
- Ensure NEXTAUTH_URL matches your actual URL

### "Email not sent" error

- Verify RESEND_API_KEY is correct
- Check that your sending domain is verified in Resend
- Ensure EMAIL_FROM uses a verified domain

### "Session not found" error

- Check that NEXTAUTH_SECRET is set and consistent
- Verify cookies are enabled in browser
- Check that NEXTAUTH_URL is correct

### Admin login fails

- Verify admin account exists in database (run `npm run db:seed`)
- Check password is correct
- Ensure bcrypt is installed and working

## Testing

### Manual Testing

1. **Google OAuth**: Visit `/api/auth/signin` and click "Sign in with Google"
2. **Email**: Visit `/api/auth/signin` and enter email address
3. **Admin**: Visit `/admin/login` and enter username/password

### Automated Testing

See `__tests__/auth.test.ts` for authentication flow tests.

## References

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Google OAuth Setup](https://console.cloud.google.com/apis/credentials)
- [Resend Documentation](https://resend.com/docs)
