import crypto from 'crypto';

/**
 * Encryption utilities for API key storage
 * Uses AES-256-GCM for authenticated encryption
 * 
 * Requirements: 10.2 - API Key Encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get the encryption key from environment variables
 * @throws {Error} If ENCRYPTION_KEY is not set or invalid
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, 'hex');
  
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters), got ${keyBuffer.length} bytes`);
  }
  
  return keyBuffer;
}

/**
 * Encrypt an API key using AES-256-GCM
 * 
 * @param plaintext - The API key to encrypt
 * @returns Encrypted string in format: iv:encrypted:authTag (all hex-encoded)
 * @throws {Error} If encryption fails or ENCRYPTION_KEY is invalid
 * 
 * @example
 * const encrypted = encryptAPIKey('sk-1234567890abcdef');
 * // Returns: "a1b2c3d4....:e5f6g7h8....:i9j0k1l2...."
 */
export function encryptAPIKey(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }
  
  const key = getEncryptionKey();
  
  // Generate random IV for this encryption
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the plaintext
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  // Return as colon-separated hex strings
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
}

/**
 * Decrypt an API key using AES-256-GCM
 * 
 * @param ciphertext - The encrypted string in format: iv:encrypted:authTag
 * @returns Decrypted API key
 * @throws {Error} If decryption fails, format is invalid, or authentication fails
 * 
 * @example
 * const decrypted = decryptAPIKey('a1b2c3d4....:e5f6g7h8....:i9j0k1l2....');
 * // Returns: "sk-1234567890abcdef"
 */
export function decryptAPIKey(ciphertext: string): string {
  if (!ciphertext) {
    throw new Error('Cannot decrypt empty string');
  }
  
  // Split the ciphertext into components
  const parts = ciphertext.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format. Expected format: iv:encrypted:authTag');
  }
  
  const [ivHex, encryptedHex, authTagHex] = parts;
  
  const key = getEncryptionKey();
  
  // Convert hex strings back to buffers
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  // Set authentication tag
  decipher.setAuthTag(authTag);
  
  // Decrypt and verify authenticity
  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Decryption failed. Data may be corrupted or tampered with.');
  }
}
