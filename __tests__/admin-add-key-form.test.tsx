import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddAPIKeyModal } from '@/components/admin/AddAPIKeyModal';
import { SuccessToast } from '@/components/admin/SuccessToast';

/**
 * Tests for API Key Creation Form
 * 
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6
 */

describe('AddAPIKeyModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AddAPIKeyModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Add New API Key')).toBeInTheDocument();
  });

  it('should display provider dropdown with correct options', () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByLabelText(/Provider/i);
    expect(providerSelect).toBeInTheDocument();
    
    // Check for provider options
    expect(screen.getByText('Select a provider')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('should display API key input field', () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    expect(keyInput).toBeInTheDocument();
    expect(keyInput).toHaveAttribute('placeholder', 'sk-...');
  });

  it('should validate non-empty provider field - Requirement 8.2, 8.6', async () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    fireEvent.change(keyInput, { target: { value: 'sk-test-key-123' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Provider is required')).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should validate non-empty key value field - Requirement 8.3, 8.6', async () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByLabelText(/Provider/i);
    fireEvent.change(providerSelect, { target: { value: 'openai' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('API key is required')).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should validate both fields are non-empty - Requirement 8.6', async () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Provider is required')).toBeInTheDocument();
      expect(screen.getByText('API key is required')).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should call API route with correct data when form is valid - Requirement 8.4', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByRole('combobox', { name: /provider/i });
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    
    fireEvent.change(providerSelect, { target: { value: 'openai' } });
    fireEvent.change(keyInput, { target: { value: 'sk-test-key-123' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'openai',
          keyValue: 'sk-test-key-123',
        }),
      });
    });
  });

  it('should call onSuccess and onClose after successful submission - Requirement 8.5', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByRole('combobox', { name: /provider/i });
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    
    fireEvent.change(providerSelect, { target: { value: 'gemini' } });
    fireEvent.change(keyInput, { target: { value: 'gemini-api-key-456' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display error message when API call fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Failed to save API key' } }),
    });

    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByRole('combobox', { name: /provider/i });
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    
    fireEvent.change(providerSelect, { target: { value: 'anthropic' } });
    fireEvent.change(keyInput, { target: { value: 'anthropic-key-789' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save API key')).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should trim whitespace from inputs before submission', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByRole('combobox', { name: /provider/i });
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    
    // Set values with whitespace
    fireEvent.change(providerSelect, { target: { value: 'openai' } });
    fireEvent.change(keyInput, { target: { value: '  sk-test-key-123  ' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    
    // Verify the API was called with trimmed values
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        keyValue: 'sk-test-key-123',
      }),
    });
  });

  it('should disable form during submission', async () => {
    (global.fetch as any).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByRole('combobox', { name: /provider/i });
    const keyInput = screen.getByRole('textbox', { name: /api key/i });
    
    fireEvent.change(providerSelect, { target: { value: 'openai' } });
    fireEvent.change(keyInput, { target: { value: 'sk-test-key-123' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument();
      expect(providerSelect).toBeDisabled();
      expect(keyInput).toBeDisabled();
    });
  });

  it('should close modal when Cancel button is clicked', () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when clicking outside (overlay)', () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const overlay = document.querySelector('.bg-gray-500');
    expect(overlay).toBeInTheDocument();
    
    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should clear form fields after successful submission', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { rerender } = render(
      <AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const providerSelect = screen.getByRole('combobox', { name: /provider/i }) as HTMLSelectElement;
    const keyInput = screen.getByRole('textbox', { name: /api key/i }) as HTMLInputElement;
    
    fireEvent.change(providerSelect, { target: { value: 'openai' } });
    fireEvent.change(keyInput, { target: { value: 'sk-test-key-123' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Reopen modal to check if fields are cleared
    rerender(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const newProviderSelect = screen.getByRole('combobox', { name: /provider/i }) as HTMLSelectElement;
    const newKeyInput = screen.getByRole('textbox', { name: /api key/i }) as HTMLInputElement;
    
    expect(newProviderSelect.value).toBe('');
    expect(newKeyInput.value).toBe('');
  });
});

describe('SuccessToast', () => {
  it('should display success message - Requirement 8.5', () => {
    const mockOnClose = vi.fn();
    
    render(
      <SuccessToast
        message="API key added successfully"
        isVisible={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('API key added successfully')).toBeInTheDocument();
  });

  it('should not render when isVisible is false', () => {
    const mockOnClose = vi.fn();
    
    const { container } = render(
      <SuccessToast
        message="API key added successfully"
        isVisible={false}
        onClose={mockOnClose}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should auto-dismiss after 3 seconds', async () => {
    const mockOnClose = vi.fn();
    
    vi.useFakeTimers();
    
    render(
      <SuccessToast
        message="API key added successfully"
        isVisible={true}
        onClose={mockOnClose}
      />
    );
    
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // Fast-forward time by 3 seconds
    await vi.advanceTimersByTimeAsync(3000);
    
    expect(mockOnClose).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});
