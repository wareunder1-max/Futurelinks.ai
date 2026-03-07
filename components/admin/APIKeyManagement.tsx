'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIKeyList } from './APIKeyList';
import { AddAPIKeyModal } from './AddAPIKeyModal';
import { EditAPIKeyModal } from './EditAPIKeyModal';
import { SuccessToast } from './SuccessToast';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

/**
 * API Key Management Component
 * 
 * Manages the API key list page with:
 * - Add New Key button that opens modal
 * - Edit button for each key that opens edit modal
 * - Success toast notification after adding/editing key
 * - Automatic refresh after successful operations
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

interface APIKey {
  id: string;
  provider: string;
  encryptedKey: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  updatedAt: Date;
}

interface APIKeyManagementProps {
  initialApiKeys: APIKey[];
}

export function APIKeyManagement({ initialApiKeys }: APIKeyManagementProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handles successful API key addition
   * Requirements: 8.5
   */
  const handleAddSuccess = () => {
    setSuccessMessage('API key added successfully');
    setShowSuccessToast(true);
    // Refresh the page to show the new key
    router.refresh();
  };

  /**
   * Handles successful API key update
   * Requirements: 9.6
   */
  const handleEditSuccess = () => {
    setSuccessMessage('API key updated successfully');
    setShowSuccessToast(true);
    // Refresh the page to show the updated key
    router.refresh();
  };

  /**
   * Handles edit button click
   * Requirements: 9.2
   */
  const handleEdit = (apiKey: APIKey) => {
    setSelectedApiKey(apiKey);
    setIsEditModalOpen(true);
  };

  /**
   * Handles delete button click (placeholder for task 11.8)
   */
  const handleDelete = (apiKey: APIKey) => {
    setSelectedApiKey(apiKey);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handles confirmed deletion
   * Requirements: 15.3, 15.5
   */
  const handleConfirmDelete = async () => {
    if (!selectedApiKey) return;

    setIsDeleting(true);

    try {
      // Call DELETE API route
      const response = await fetch(`/api/admin/keys/${selectedApiKey.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to delete API key');
      }

      // Success - show confirmation message
      setSuccessMessage('API key deleted successfully');
      setShowSuccessToast(true);
      setIsDeleteDialogOpen(false);
      setSelectedApiKey(null);
      
      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error('Error deleting API key:', error);
      // Show error message
      setSuccessMessage(error instanceof Error ? error.message : 'Failed to delete API key');
      setShowSuccessToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles delete dialog close
   */
  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
      setSelectedApiKey(null);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage API keys for external AI providers (OpenAI, Google Gemini, Anthropic)
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Add New Key
            </button>
          </div>
        </div>

        <div className="mt-8">
          <APIKeyList 
            apiKeys={initialApiKeys} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Add API Key Modal */}
      <AddAPIKeyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit API Key Modal */}
      <EditAPIKeyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedApiKey(null);
        }}
        onSuccess={handleEditSuccess}
        apiKey={selectedApiKey}
      />

      {/* Success Toast */}
      <SuccessToast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        itemName={selectedApiKey?.provider || ''}
      />
    </>
  );
}
