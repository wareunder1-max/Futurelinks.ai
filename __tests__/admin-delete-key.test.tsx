import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DeleteConfirmationDialog } from '@/components/admin/DeleteConfirmationDialog';

/**
 * Unit tests for Delete Confirmation Dialog
 * 
 * Tests:
 * - Dialog renders when open
 * - Dialog does not render when closed
 * - Cancel button closes dialog
 * - Confirm button calls onConfirm
 * - Buttons are disabled during deletion
 * 
 * Requirements: 15.2
 */

describe('DeleteConfirmationDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
        itemName="OpenAI"
      />
    );

    expect(screen.queryByText('Delete API Key')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
        itemName="OpenAI"
      />
    );

    expect(screen.getByText('Delete API Key')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the API key for/)).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
        itemName="OpenAI"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
        itemName="OpenAI"
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should disable buttons when isDeleting is true', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
        itemName="OpenAI"
      />
    );

    const deleteButton = screen.getByText('Deleting...');
    const cancelButton = screen.getByText('Cancel');

    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should show "Deleting..." text when isDeleting is true', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
        itemName="OpenAI"
      />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should display warning message about cascade deletion', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={false}
        itemName="Google Gemini"
      />
    );

    expect(
      screen.getByText(/This action cannot be undone and will also remove all associated usage logs/)
    ).toBeInTheDocument();
  });
});
