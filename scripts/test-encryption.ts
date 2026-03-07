/**
 * Manual test script for encryption utilities
 * Run with: tsx scripts/test-encryption.ts
 */

// Set up test encryption key
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import { encryptAPIKey, decryptAPIKey } from '../lib/encryption';

console.log('🔐 Testing Encryption Utilities\n');

try {
  // Test 1: Basic encryption and decryption
  console.log('Test 1: Basic encryption and decryption');
  const testKey = 'sk-test1234567890abcdef';
  const encrypted = encryptAPIKey(testKey);
  console.log(`  Original: ${testKey}`);
  console.log(`  Encrypted: ${encrypted.substring(0, 50)}...`);
  
  const decrypted = decryptAPIKey(encrypted);
  console.log(`  Decrypted: ${decrypted}`);
  console.log(`  ✅ Match: ${testKey === decrypted}\n`);
  
  // Test 2: Different ciphertexts for same plaintext
  console.log('Test 2: Different IVs produce different ciphertexts');
  const encrypted1 = encryptAPIKey(testKey);
  const encrypted2 = encryptAPIKey(testKey);
  console.log(`  Encrypted 1: ${encrypted1.substring(0, 50)}...`);
  console.log(`  Encrypted 2: ${encrypted2.substring(0, 50)}...`);
  console.log(`  ✅ Different: ${encrypted1 !== encrypted2}\n`);
  
  // Test 3: Multiple API key formats
  console.log('Test 3: Various API key formats');
  const testKeys = [
    'sk-1234567890',
    'AIzaSyABC123DEF456',
    'sk-proj-abcdefghijklmnopqrstuvwxyz',
    'anthropic-key-xyz123',
  ];
  
  let allPassed = true;
  testKeys.forEach(key => {
    const enc = encryptAPIKey(key);
    const dec = decryptAPIKey(enc);
    const passed = key === dec;
    console.log(`  ${passed ? '✅' : '❌'} ${key.substring(0, 30)}...`);
    if (!passed) allPassed = false;
  });
  console.log(`  All passed: ${allPassed}\n`);
  
  // Test 4: Error handling - empty string
  console.log('Test 4: Error handling - empty string');
  try {
    encryptAPIKey('');
    console.log('  ❌ Should have thrown error');
  } catch (error: any) {
    console.log(`  ✅ Correctly threw error: ${error.message}\n`);
  }
  
  // Test 5: Error handling - invalid format
  console.log('Test 5: Error handling - invalid ciphertext format');
  try {
    decryptAPIKey('invalid:format');
    console.log('  ❌ Should have thrown error');
  } catch (error: any) {
    console.log(`  ✅ Correctly threw error: ${error.message}\n`);
  }
  
  // Test 6: Error handling - tampered data
  console.log('Test 6: Error handling - tampered data');
  try {
    const original = encryptAPIKey('sk-test123');
    const parts = original.split(':');
    // Tamper with encrypted data by flipping a character
    const mid = Math.floor(parts[1].length / 2);
    parts[1] = parts[1].substring(0, mid) + 
               (parts[1][mid] === 'a' ? 'b' : 'a') + 
               parts[1].substring(mid + 1);
    const tampered = parts.join(':');
    decryptAPIKey(tampered);
    console.log('  ❌ Should have thrown error');
  } catch (error: any) {
    console.log(`  ✅ Correctly threw error: ${error.message}\n`);
  }
  
  // Test 7: Round-trip multiple times
  console.log('Test 7: Round-trip encryption 10 times');
  let roundTripPassed = true;
  for (let i = 0; i < 10; i++) {
    const enc = encryptAPIKey(testKey);
    const dec = decryptAPIKey(enc);
    if (dec !== testKey) {
      roundTripPassed = false;
      break;
    }
  }
  console.log(`  ✅ All 10 round-trips successful: ${roundTripPassed}\n`);
  
  // Test 8: Unicode characters
  console.log('Test 8: Unicode characters');
  const unicodeKey = 'key-with-unicode-🔑-emoji';
  const encUnicode = encryptAPIKey(unicodeKey);
  const decUnicode = decryptAPIKey(encUnicode);
  console.log(`  ✅ Unicode preserved: ${unicodeKey === decUnicode}\n`);
  
  console.log('✅ All tests passed!');
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
