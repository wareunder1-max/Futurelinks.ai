import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * NextAuth.js v5 Setup
 * 
 * Exports:
 * - handlers: GET and POST handlers for the API route
 * - auth: Function to get the current session
 * - signIn: Function to sign in programmatically
 * - signOut: Function to sign out programmatically
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
