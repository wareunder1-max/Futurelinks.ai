'use client';

import { useState } from 'react';

/**
 * Add API Key Modal Component
 * 
 * Modal form for adding new API keys with:
 * - Provider dropdown (OpenAI, Gemini, Anthropic)
 * - Credential string input
 * - Non-empty field validation
 * - API route integration for saving
 * - Confirmation message display
 * 
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6
 */

interface AddAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAPIKeyModal({ isOpen, onClose, onSuccess }: AddAPIKeyModalProps) {
  const [provider, setProvider] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    provider?: string;
    keyValue?: string;
  }>({});

  if (!isOpen) {
    return null;
  }

  /**
   * Validates form fields
   * Requirements: 8.2, 8.3, 8.6
   */
  const validateForm = (): boolean => {
    const errors: { provider?: string; keyValue?: string } = {};

    if (!provider || provider.trim() === '') {
      errors.provider = 'Provider is required';
    }

    if (!keyValue || keyValue.trim() === '') {
      errors.keyValue = 'API key is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission
   * Requirements: 8.4, 8.5
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate fields
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API route to save key (Task 11.10)
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider.trim(),
          keyValue: keyValue.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to add API key');
      }

      // Success - close modal and trigger refresh
      setProvider('');
      setKeyValue('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setProvider('');
      setKeyValue('');
      setError('');
      setValidationErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                Add New API Key
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Add a new API key for an external AI provider. The key will be encrypted before storage.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Provider dropdown */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                  Provider <span className="text-red-500">*</span>
                </label>
                <select
                  id="provider"
                  name="provider"
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, provider: undefined }));
                  }}
                  className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${
                    validationErrors.provider ? 'border-red-300' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select a provider</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="anthropic">Anthropic</option>
                </select>
                {validationErrors.provider && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.provider}</p>
                )}
              </div>

              {/* API Key input */}
              <div>
                <label htmlFor="keyValue" className="block text-sm font-medium text-gray-700">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="keyValue"
                  name="keyValue"
                  value={keyValue}
                  onChange={(e) => {
                    setKeyValue(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, keyValue: undefined }));
                  }}
                  placeholder="sk-..."
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    validationErrors.keyValue ? 'border-red-300' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {validationErrors.keyValue && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.keyValue}</p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Key'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
