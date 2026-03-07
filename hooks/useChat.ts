'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Message Interface
 * Represents a single message in the chat conversation
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Chat State Interface
 * Manages the complete state of the chat interface
 */
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/**
 * useChat Hook
 * 
 * Custom hook for managing chat state and interactions with:
 * - Messages array management
 * - Loading state tracking
 * - Error state handling
 * - Message submission logic
 * - Server-Sent Events (SSE) streaming support for real-time AI responses
 * 
 * Requirements: 4.1, 4.4
 * 
 * @example
 * ```tsx
 * const { messages, isLoading, error, sendMessage, clearError } = useChat();
 * 
 * const handleSubmit = async (text: string) => {
 *   await sendMessage(text);
 * };
 * ```
 */
export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Track the current streaming message being built
  const streamingMessageRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Add a user message to the chat
   */
  const addUserMessage = useCallback((content: string): Message => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    return userMessage;
  }, []);

  /**
   * Add or update an assistant message
   */
  const updateAssistantMessage = useCallback((content: string, messageId?: string) => {
    setState((prev) => {
      const existingIndex = prev.messages.findIndex((m) => m.id === messageId);

      if (existingIndex !== -1 && messageId) {
        // Update existing message
        const updatedMessages = [...prev.messages];
        updatedMessages[existingIndex] = {
          ...updatedMessages[existingIndex],
          content,
        };
        return { ...prev, messages: updatedMessages };
      } else {
        // Add new message
        const assistantMessage: Message = {
          id: messageId || `assistant-${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: new Date(),
        };
        return { ...prev, messages: [...prev.messages, assistantMessage] };
      }
    });
  }, []);

  /**
   * Handle streaming response using Server-Sent Events
   */
  const handleStreamingResponse = useCallback(
    async (response: Response): Promise<void> => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      streamingMessageRef.current = '';
      const messageId = `assistant-${Date.now()}`;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            // Parse SSE format: "data: {json}"
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              // Check for stream end signal
              if (data === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Handle different SSE message formats
                if (parsed.content) {
                  streamingMessageRef.current += parsed.content;
                  updateAssistantMessage(streamingMessageRef.current, messageId);
                } else if (parsed.delta?.content) {
                  streamingMessageRef.current += parsed.delta.content;
                  updateAssistantMessage(streamingMessageRef.current, messageId);
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                console.warn('Failed to parse SSE data:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
    [updateAssistantMessage]
  );

  /**
   * Handle non-streaming JSON response
   */
  const handleJsonResponse = useCallback(
    async (response: Response): Promise<void> => {
      const data = await response.json();

      if (data.response) {
        updateAssistantMessage(data.response);
      } else if (data.content) {
        updateAssistantMessage(data.content);
      } else {
        updateAssistantMessage('No response received');
      }
    },
    [updateAssistantMessage]
  );

  /**
   * Send a message to the AI proxy
   * Supports both streaming (SSE) and non-streaming responses
   * 
   * @param message - The user's message text
   * @returns Promise that resolves when the response is complete
   */
  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      // Validate input
      if (!message.trim()) {
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Add user message
      addUserMessage(message);

      // Set loading state
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Get conversation history (excluding the message we just added)
        const conversationHistory = state.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Call API proxy endpoint
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.trim(),
            conversationHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message ||
              `API request failed with status ${response.status}`
          );
        }

        // Check if response is streaming (SSE)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/event-stream')) {
          await handleStreamingResponse(response);
        } else {
          await handleJsonResponse(response);
        }
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        console.error('Chat error:', err);
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to send message. Please try again.',
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
        abortControllerRef.current = null;
      }
    },
    [state.messages, addUserMessage, handleStreamingResponse, handleJsonResponse]
  );

  /**
   * Cancel the current request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
    streamingMessageRef.current = '';
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearError,
    cancelRequest,
    clearMessages,
  };
}
