# Admin Session Timeout Implementation

## Overview

This document describes the implementation of admin session timeout logic for the AI FutureLinks Platform, fulfilling task 4.7 and requirements 14.1-14.4.

## Requirements Addressed

- **14.1**: Automatic session termination after 30 minutes of inactivity
- **14.2**: Redirect to admin login page on timeout
- **14.3**: Display timeout notification message
- **14.4**: Extend timeout period with each user interaction
- **14.5**: Validate session tokens on each request

## Architecture

### 1. Server-Side Session Management

**File**: `lib/admin-session.ts`

Provides server-side utilities for:
- Validating admin sessions
- Checking session timeout based on last activity
- Updating activity timestamps via cookies
- Redirecting expired sessions with appropriate error messages

**Key Functions**:
- `validateAdminSession(request)`: Validates admin session and checks for timeout
- `isAdminSession(session)`: Checks if a session belongs to an admin
- `getRemainingSessionTime(lastActivity)`: Calculates remaining session time
- `formatRemainingTime(milliseconds)`: Formats time for display

### 2. Middleware Integration

**File**: `middleware.ts`

Enhanced Next.js middleware to:
- Intercept all admin route requests (except `/admin/login`)
- Validate admin session before allowing access
- Track last activity via HTTP-only cookies
- Redirect expired sessions to login with timeout notification
- Extend session timeout on each valid request

**Flow**:
1. Request to admin route → Middleware intercepts
2. Check if user has valid admin session
3. Check last activity timestamp from cookie
4. If inactive > 30 minutes → Redirect to login with `?error=timeout`
5. If active → Update activity cookie and allow request

### 3. Client-Side Activity Tracking

**File**: `hooks/useAdminSessionTimeout.ts`

React hook that:
- Monitors user activity (mouse, keyboard, touch events)
- Tracks time since last activity
- Shows warning 5 minutes before timeout
- Automatically logs out on timeout
- Throttles activity updates to avoid excessive state changes

**Usage**:
```typescript
const { showWarning, formatRemainingTime, updateActivity } = useAdminSessionTimeout({
  enabled: true,
  onWarning: () => console.log('Session expiring soon'),
  onTimeout: () => console.log('Session expired'),
});
```

### 4. Warning Component

**File**: `components/admin/SessionTimeoutWarning.tsx`

Visual warning banner that:
- Appears 5 minutes before session expires
- Shows countdown timer
- Dismisses on user interaction (which extends session)
- Provides clear messaging about session expiration

### 5. Login Page

**File**: `app/admin/login/page.tsx`

Admin login page with:
- Username/password form
- Error handling for various scenarios
- Special handling for timeout notifications
- Clear messaging about session duration

**Error Messages**:
- `?error=timeout`: "Your session has expired due to inactivity. Please log in again."
- `?error=unauthorized`: "You must be logged in as an administrator to access this page."
- `?error=CredentialsSignin`: "Invalid username or password. Please try again."

## Session Flow

### Normal Session Flow

```
1. Admin logs in → Session created with JWT
2. Admin navigates to /admin/keys
3. Middleware validates session
4. Middleware sets activity cookie (timestamp)
5. Admin performs actions
6. Each request updates activity cookie
7. Session remains active as long as user is active
```

### Timeout Flow

```
1. Admin is inactive for 25 minutes
2. Client-side hook shows warning banner
3. Admin continues to be inactive
4. After 30 minutes total inactivity:
   - Server: Next request fails validation, redirects to login
   - Client: Hook triggers automatic logout
5. Admin sees login page with timeout message
6. Admin must re-authenticate
```

## Configuration

### Session Timeout Duration

Configured in two places (must match):

1. **NextAuth Config** (`lib/auth.config.ts`):
```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 60, // 30 minutes in seconds
}
```

2. **Admin Session Utils** (`lib/admin-session.ts`):
```typescript
export const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
```

### Warning Threshold

Configured in `hooks/useAdminSessionTimeout.ts`:
```typescript
const WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning 5 minutes before timeout
```

## Security Features

1. **HTTP-Only Cookies**: Activity timestamp stored in HTTP-only cookie, not accessible to JavaScript
2. **Secure Flag**: Cookies marked secure in production (HTTPS only)
3. **SameSite Protection**: Cookies use `sameSite: 'lax'` to prevent CSRF
4. **Path Restriction**: Activity cookie scoped to `/admin` path only
5. **Server-Side Validation**: All session checks performed server-side
6. **Automatic Cleanup**: Expired cookies automatically deleted

## Testing

**File**: `lib/__tests__/admin-session.test.ts`

Tests cover:
- Admin session identification
- Remaining time calculation
- Time formatting
- Edge cases (expired sessions, negative times)
- Timeout constant validation

Run tests:
```bash
npm test -- admin-session --run
```

## Usage in Admin Pages

To add session timeout monitoring to an admin page:

```typescript
import { SessionTimeoutWarning } from '@/components/admin/SessionTimeoutWarning';

export default function AdminPage() {
  return (
    <div>
      <SessionTimeoutWarning />
      {/* Rest of admin page content */}
    </div>
  );
}
```

The warning component will automatically:
- Monitor user activity
- Show warning when approaching timeout
- Handle automatic logout on timeout
- Extend session on user interaction

## Future Enhancements

Potential improvements:
1. Configurable timeout duration per admin user
2. "Remember me" option for extended sessions
3. Activity logging for security audits
4. Multiple concurrent session detection
5. Grace period for session extension after timeout
6. WebSocket-based real-time session monitoring

## Related Files

- `lib/auth.config.ts` - NextAuth configuration with session timeout
- `lib/auth-setup.ts` - NextAuth initialization
- `middleware.ts` - Request interception and session validation
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API routes

## Requirements Validation

✅ **14.1**: Session automatically terminates after 30 minutes of inactivity (server-side validation in middleware)

✅ **14.2**: Session termination redirects to admin login page (middleware redirect)

✅ **14.3**: Timeout notification displayed via URL parameter (`?error=timeout`)

✅ **14.4**: Session timeout extended with each user interaction (activity cookie updated on each request)

✅ **14.5**: Session tokens validated on each request (middleware validation before allowing access)
