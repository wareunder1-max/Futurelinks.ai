import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

/**
 * NextAuth.js Type Extensions
 * 
 * Extends the default NextAuth types to include custom fields:
 * - role: 'public' | 'admin' - User role for authorization
 */

declare module 'next-auth' {
  /**
   * Extended Session interface
   * Adds role to the user object in the session
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'public' | 'admin';
    } & DefaultSession['user'];
  }

  /**
   * Extended User interface
   * Adds role to the user object
   */
  interface User extends DefaultUser {
    role?: 'public' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   * Adds role to the JWT token
   */
  interface JWT extends DefaultJWT {
    id?: string;
    role?: 'public' | 'admin';
  }
}
