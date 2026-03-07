#!/usr/bin/env node

/**
 * Verify environment variable configuration
 * Run with: node scripts/verify-env.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('');
  console.log('Please create .env.local from the template:');
  console.log('  cp .env.local.template .env.local');
  console.log('');
  console.log('Then fill in the required values.');
  console.log('See docs/ENVIRONMENT_SETUP.md for detailed instructions.');
  process.exit(1);
}

// Parse .env.local manually (simple parser)
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

console.log('='.repeat(80));
console.log('AI FutureLinks Platform - Environment Variable Verification');
console.log('='.repeat(80));
console.log('');

let hasErrors = false;
let hasWarnings = false;

// Helper functions
function checkRequired(key, description) {
  if (!env[key] || env[key].includes('your-') || env[key].includes('change-this')) {
    console.log(`❌ ${key}: Missing or using placeholder value`);
    console.log(`   ${description}`);
    console.log('');
    hasErrors = true;
    return false;
  } else {
    console.log(`✅ ${key}: Set`);
    return true;
  }
}

function checkOptional(key, description) {
  if (!env[key] || env[key].includes('your-') || env[key].includes('change-this')) {
    console.log(`⚠️  ${key}: Not configured (optional)`);
    console.log(`   ${description}`);
    console.log('');
    hasWarnings = true;
    return false;
  } else {
    console.log(`✅ ${key}: Set`);
    return true;
  }
}

// Check database configuration
console.log('📦 Database Configuration:');
console.log('-'.repeat(80));
checkRequired('DATABASE_URL', 'Connection pooling URL for Prisma Client');
checkRequired('DIRECT_URL', 'Direct connection URL for migrations');
console.log('');

// Check encryption key
console.log('🔐 Security & Encryption:');
console.log('-'.repeat(80));
if (checkRequired('ENCRYPTION_KEY', '32-byte hex string for API key encryption')) {
  const key = env.ENCRYPTION_KEY;
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    console.log('   ❌ ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes)');
    console.log('   Generate with: node scripts/generate-keys.js');
    console.log('');
    hasErrors = true;
  } else {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length === 32) {
        console.log('   ✅ ENCRYPTION_KEY format is valid (32 bytes)');
      } else {
        console.log('   ❌ ENCRYPTION_KEY length is incorrect');
        hasErrors = true;
      }
    } catch (error) {
      console.log('   ❌ ENCRYPTION_KEY is not valid hex');
      hasErrors = true;
    }
  }
}
console.log('');

// Check NextAuth configuration
console.log('🔑 NextAuth Configuration:');
console.log('-'.repeat(80));
checkRequired('NEXTAUTH_URL', 'Canonical URL of your application');
if (checkRequired('NEXTAUTH_SECRET', 'Secret for signing and encrypting tokens')) {
  const secret = env.NEXTAUTH_SECRET;
  if (secret.length < 32) {
    console.log('   ⚠️  NEXTAUTH_SECRET should be at least 32 characters for security');
    console.log('   Generate with: node scripts/generate-keys.js');
    console.log('');
    hasWarnings = true;
  } else {
    console.log('   ✅ NEXTAUTH_SECRET length is adequate');
  }
}
console.log('');

// Check Google OAuth
console.log('🔐 Google OAuth Credentials:');
console.log('-'.repeat(80));
checkRequired('GOOGLE_CLIENT_ID', 'Google OAuth 2.0 Client ID');
checkRequired('GOOGLE_CLIENT_SECRET', 'Google OAuth 2.0 Client Secret');
console.log('');

// Check email provider (optional)
console.log('📧 Email Provider (Optional):');
console.log('-'.repeat(80));
checkOptional('EMAIL_SERVER', 'SMTP server for magic link authentication');
checkOptional('EMAIL_FROM', 'From address for authentication emails');
console.log('');

// Check initial admin credentials
console.log('👤 Initial Admin Credentials:');
console.log('-'.repeat(80));
checkRequired('INITIAL_ADMIN_USERNAME', 'Username for first admin account');
if (checkRequired('INITIAL_ADMIN_PASSWORD', 'Password for first admin account')) {
  const password = env.INITIAL_ADMIN_PASSWORD;
  if (password.length < 8) {
    console.log('   ❌ INITIAL_ADMIN_PASSWORD must be at least 8 characters');
    console.log('');
    hasErrors = true;
  } else {
    console.log('   ✅ INITIAL_ADMIN_PASSWORD meets minimum length requirement');
    if (password === 'change-this-password-immediately' || password.toLowerCase().includes('password')) {
      console.log('   ⚠️  Remember to change this password after first login!');
      hasWarnings = true;
    }
  }
}
console.log('');

// Summary
console.log('='.repeat(80));
console.log('Summary:');
console.log('='.repeat(80));

if (hasErrors) {
  console.log('❌ Configuration has errors that must be fixed');
  console.log('');
  console.log('Please update your .env.local file with the correct values.');
  console.log('See docs/ENVIRONMENT_SETUP.md for detailed instructions.');
  console.log('');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration is valid but has warnings');
  console.log('');
  console.log('Your environment is configured, but consider addressing the warnings above.');
  console.log('');
  process.exit(0);
} else {
  console.log('✅ All environment variables are properly configured!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run database migrations: npm run db:migrate');
  console.log('  2. Seed the database: npm run db:seed');
  console.log('  3. Start development server: npm run dev');
  console.log('');
  process.exit(0);
}
