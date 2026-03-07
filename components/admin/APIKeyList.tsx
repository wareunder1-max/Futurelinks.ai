'use client';

/**
 * API Key List Component
 * 
 * Displays API keys in a table format with:
 * - Masked key display (shows first 7 and last 4 characters)
 * - Provider name
 * - Created date
 * - Last used date
 * - Edit and Delete action buttons
 * 
 * Requirements: 8.1, 9.1, 9.2
 */

interface APIKey {
  id: string;
  provider: string;
  encryptedKey: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  updatedAt: Date;
}

interface APIKeyListProps {
  apiKeys: APIKey[];
  onEdit: (apiKey: APIKey) => void;
  onDelete: (apiKey: APIKey) => void;
}

/**
 * Masks an API key for secure display
 * Shows first 7 characters and last 4 characters with "..." in between
 * Example: "sk-proj-abc...xyz"
 */
function maskAPIKey(encryptedKey: string): string {
  if (encryptedKey.length <= 11) {
    return '***...***';
  }
  
  const prefix = encryptedKey.substring(0, 7);
  const suffix = encryptedKey.substring(encryptedKey.length - 4);
  return `${prefix}...${suffix}`;
}

/**
 * Formats a date for display
 */
function formatDate(date: Date | null): string {
  if (!date) {
    return 'Never';
  }
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Capitalizes provider name for display
 */
function formatProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    anthropic: 'Anthropic',
  };
  
  return providerMap[provider.toLowerCase()] || provider;
}

export function APIKeyList({ apiKeys, onEdit, onDelete }: APIKeyListProps) {
  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a new API key for an AI provider.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Provider
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              API Key
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Created
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Last Used
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {formatProvider(apiKey.provider)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                {maskAPIKey(apiKey.encryptedKey)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDate(apiKey.createdAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDate(apiKey.lastUsedAt)}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  type="button"
                  onClick={() => onEdit(apiKey)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(apiKey)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
