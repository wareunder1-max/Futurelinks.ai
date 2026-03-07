import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt hashing.
 * Higher values increase security but also increase computation time.
 * 12 rounds provides a good balance between security and performance.
 */
const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 * 
 * @param password - The plaintext password to hash
 * @returns A promise that resolves to the hashed password
 * @throws Error if password is empty or hashing fails
 * 
 * @example
 * const hashedPassword = await hashPassword('mySecurePassword123');
 * // Returns: $2a$12$...
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Failed to hash password: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * 
 * @param password - The plaintext password to verify
 * @param hash - The bcrypt hash to compare against
 * @returns A promise that resolves to true if the password matches, false otherwise
 * @throws Error if inputs are invalid or verification fails
 * 
 * @example
 * const isValid = await verifyPassword('mySecurePassword123', hashedPassword);
 * // Returns: true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  if (!hash || hash.trim().length === 0) {
    throw new Error('Hash cannot be empty');
  }

  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
