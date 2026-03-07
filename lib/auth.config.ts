import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from './auth';
import { prisma } from './prisma';

/**
 * NextAuth.js v5 Configuration
 * 
 * This configuration supports:
 * - Google OAuth for public users
 * - Email (magic links) for public users
 * - Credentials provider for admin authentication
 * 
 * Session strategy: JWT
 * Session includes: user role (public/admin)
 */
export const authConfig: NextAuthConfig = {
  providers: [
    // Google OAuth Provider for public users
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Email Provider (magic links) for public users
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || 'noreply@futurelinks.art',
    }),

    // Credentials Provider for admin authentication
    Credentials({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Query admin from database
          const admin = await prisma.admin.findUnique({
            where: { username: credentials.username as string },
          });

          if (!admin) {
            return null;
          }

          // Verify password
          const isValid = await verifyPassword(
            credentials.password as string,
            admin.passwordHash
          );

          if (!isValid) {
            return null;
          }

          // Update last login timestamp
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
          });

          // Return admin user object with role
          return {
            id: admin.id,
            name: admin.username,
            email: `${admin.username}@admin.local`, // Admins don't have email
            role: 'admin',
          };
        } catch (error) {
          console.error('Admin authentication error:', error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes for admin sessions
  },

  callbacks: {
    /**
     * JWT Callback
     * Runs whenever a JWT is created or updated
     * Adds user role to the token
     */
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'public';
        
        // For public users (Google/Email), create or update User record
        if (account?.provider === 'google' || account?.provider === 'nodemailer') {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });

            if (existingUser) {
              // Update last login
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: new Date() },
              });
              token.id = existingUser.id;
            } else {
              // Create new user
              const newUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name,
                  provider: account.provider,
                  lastLoginAt: new Date(),
                },
              });
              token.id = newUser.id;
            }
            token.role = 'public';
          } catch (error) {
            console.error('Error creating/updating user:', error);
          }
        }
      }

      // Session update (e.g., user updates profile)
      if (trigger === 'update') {
        // Handle session updates if needed
      }

      return token;
    },

    /**
     * Session Callback
     * Runs whenever a session is checked
     * Attaches user role to the session object
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'public' | 'admin';
      }
      return session;
    },

    /**
     * SignIn Callback
     * Controls whether a user is allowed to sign in
     */
    async signIn({ user, account, profile }) {
      // Allow all sign-ins
      return true;
    },

    /**
     * Redirect Callback
     * Controls where users are redirected after authentication
     */
    async redirect({ url, baseUrl }) {
      // Redirect admins to admin dashboard
      if (url.includes('/admin')) {
        return `${baseUrl}/admin/keys`;
      }
      
      // Redirect public users to chat interface
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Default redirect to chat
      return `${baseUrl}/chat`;
    },
  },

  events: {
    /**
     * SignIn Event
     * Triggered on successful sign in
     */
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },

    /**
     * SignOut Event
     * Triggered on sign out
     */
    async signOut(message) {
      console.log('User signed out');
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
