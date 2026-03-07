#!/usr/bin/env node

/**
 * Generate secure keys for environment variables
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');

console.log('='.repeat(80));
console.log('AI FutureLinks Platform - Security Key Generator');
console.log('='.repeat(80));
console.log('');

// Generate ENCRYPTION_KEY (32-byte hex for AES-256-GCM)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY (32-byte hex for AES-256-GCM):');
console.log(encryptionKey);
console.log('');

// Generate NEXTAUTH_SECRET (32-byte base64)
const nextAuthSecret = crypto.randomBytes(32).toString('base64');
console.log('NEXTAUTH_SECRET (32-byte base64):');
console.log(nextAuthSecret);
console.log('');

console.log('='.repeat(80));
console.log('Copy these values to your .env.local file');
console.log('IMPORTANT: Keep these secret and never commit them to version control!');
console.log('='.repeat(80));
console.log('');

// Also output as env format for easy copying
console.log('# Copy and paste these lines into your .env.local file:');
console.log('');
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);
console.log('');
