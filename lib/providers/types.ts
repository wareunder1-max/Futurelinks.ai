/**
 * Shared Provider Types
 * 
 * Common types used across all AI provider modules
 */

export interface StandardMessage {
  role: 'user' | 'assistant';
  content: string;
}
