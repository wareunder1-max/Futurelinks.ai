import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddAPIKeyModal } from '@/components/admin/AddAPIKeyModal';
import { SuccessToast } from '@/components/admin/SuccessToast';

/**
 * Tests for API Key Creation Form
 * 
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6
 */

describe('AddAPIKeyModal - Core Functionality', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render modal with provider dropdown and key input - Requirements 8.2, 8.3', () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    expect(screen.getByText('Add New API Key')).toBeInTheDocument();
    expect(screen.getByLabelText(/Provider/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    
    // Check provider options
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('should validate non-empty fields - Requirement 8.6', async () => {
    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Provider is required')).toBeInTheDocument();
      expect(screen.getByText('API key is required')).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should call API route with correct data - Requirement 8.4', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AddAPIKeyModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const providerSelect = screen.getByLabelText(/Provider/i);
    const keyInput = screen.getByPlaceholderText('sk-...');
    
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
    
    const providerSelect = screen.getByLabelText(/Provider/i);
    const keyInput = screen.getByPlaceholderText('sk-...');
    
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
    
    const providerSelect = screen.getByLabelText(/Provider/i);
    const keyInput = screen.getByPlaceholderText('sk-...');
    
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
});
