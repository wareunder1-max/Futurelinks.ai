/**
 * Tests for EditAPIKeyModal component
 * 
 * Validates:
 * - Modal displays with current values pre-populated (Requirement 9.2)
 * - Provider and credential can be modified (Requirement 9.3, 9.4)
 * - Form validation works correctly
 * - API route is called with correct data (Requirement 9.5)
 * - Success callback is triggered (Requirement 9.6)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditAPIKeyModal } from '@/components/admin/EditAPIKeyModal';

// Mock the encryption functions
vi.mock('@/lib/encryption', () => ({
  decryptAPIKey: vi.fn(),
  encryptAPIKey: vi.fn(),
}));

import { decryptAPIKey } from '@/lib/encryption';

// Mock fetch
global.fetch = vi.fn();

describe('EditAPIKeyModal', () => {
  const mockApiKey = {
    id: 'test-key-id',
    provider: 'openai',
    encryptedKey: 'encrypted-key-value',
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(decryptAPIKey).mockReturnValue('sk-test-key-1234567890');
    
    // Mock the GET request to fetch decrypted key
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        apiKey: {
          id: 'test-key-id',
          provider: 'openai',
          encryptedKey: 'encrypted-key-value',
          decryptedKey: 'sk-test-key-1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <EditAPIKeyModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    expect(screen.getByText('Edit API Key')).toBeInTheDocument();
  });

  it('should pre-populate form with current values (Requirement 9.2)', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      const providerSelect = screen.getByLabelText(/Provider/i) as HTMLSelectElement;
      expect(providerSelect.value).toBe('openai');

      const keyInput = screen.getByRole('textbox', { name: /API Key/i }) as HTMLInputElement;
      expect(keyInput.value).toBe('sk-test-key-1234567890');
    });

    // Verify fetch was called to get the decrypted key
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/keys/test-key-id');
  });

  it('should allow modification of provider (Requirement 9.3)', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      const providerSelect = screen.getByLabelText(/Provider/i) as HTMLSelectElement;
      expect(providerSelect.value).toBe('openai');
    });

    const providerSelect = screen.getByLabelText(/Provider/i);
    fireEvent.change(providerSelect, { target: { value: 'gemini' } });

    expect((providerSelect as HTMLSelectElement).value).toBe('gemini');
  });

  it('should allow modification of credential (Requirement 9.4)', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      const keyInput = screen.getByRole('textbox', { name: /API Key/i }) as HTMLInputElement;
      expect(keyInput.value).toBe('sk-test-key-1234567890');
    });

    const keyInput = screen.getByRole('textbox', { name: /API Key/i });
    fireEvent.change(keyInput, { target: { value: 'sk-new-key-9876543210' } });

    expect((keyInput as HTMLInputElement).value).toBe('sk-new-key-9876543210');
  });

  it('should validate empty provider field', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Provider/i)).toBeInTheDocument();
    });

    const providerSelect = screen.getByLabelText(/Provider/i);
    fireEvent.change(providerSelect, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /Update Key/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Provider is required')).toBeInTheDocument();
    });

    // Fetch should only be called once for GET, not for PUT since validation failed
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/keys/test-key-id');
  });

  it('should validate empty key value field', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      const keyInput = screen.getByRole('textbox', { name: /API Key/i });
      expect(keyInput).toBeInTheDocument();
    });

    const keyInput = screen.getByRole('textbox', { name: /API Key/i });
    fireEvent.change(keyInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /Update Key/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API key is required')).toBeInTheDocument();
    });

    // Fetch should only be called once for GET, not for PUT since validation failed
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/keys/test-key-id');
  });

  it('should call API route to update key (Requirement 9.5)', async () => {
    // Mock GET request to fetch decrypted key
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        apiKey: {
          id: 'test-key-id',
          provider: 'openai',
          encryptedKey: 'encrypted-key-value',
          decryptedKey: 'sk-test-key-1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    } as Response);
    
    // Mock PUT request to update key
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'API key updated successfully' }),
    } as Response);

    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Provider/i)).toBeInTheDocument();
    });

    const providerSelect = screen.getByLabelText(/Provider/i);
    fireEvent.change(providerSelect, { target: { value: 'anthropic' } });

    const keyInput = screen.getByRole('textbox', { name: /API Key/i });
    fireEvent.change(keyInput, { target: { value: 'sk-updated-key-1234567890' } });

    const submitButton = screen.getByRole('button', { name: /Update Key/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/keys/test-key-id',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'anthropic',
            keyValue: 'sk-updated-key-1234567890',
          }),
        })
      );
    });
  });

  it('should display confirmation and close modal on success (Requirement 9.6)', async () => {
    // Mock GET request to fetch decrypted key
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        apiKey: {
          id: 'test-key-id',
          provider: 'openai',
          encryptedKey: 'encrypted-key-value',
          decryptedKey: 'sk-test-key-1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    } as Response);
    
    // Mock PUT request to update key
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'API key updated successfully' }),
    } as Response);

    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Provider/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Update Key/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display error message on API failure', async () => {
    // Mock GET request to fetch decrypted key
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        apiKey: {
          id: 'test-key-id',
          provider: 'openai',
          encryptedKey: 'encrypted-key-value',
          decryptedKey: 'sk-test-key-1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    } as Response);
    
    // Mock PUT request failure
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: 'Failed to update API key' },
      }),
    } as Response);

    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Provider/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Update Key/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update API key')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when background overlay is clicked', async () => {
    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Edit API Key')).toBeInTheDocument();
    });

    const overlay = document.querySelector('.bg-gray-500');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle decryption error gracefully', async () => {
    // Mock GET request failure
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: 'Failed to decrypt API key' },
      }),
    } as Response);

    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <EditAPIKeyModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to decrypt API key')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});
