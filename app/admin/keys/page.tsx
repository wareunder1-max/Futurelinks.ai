import { prisma } from '@/lib/prisma';
import dynamicImport from 'next/dynamic';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

// Dynamic import for APIKeyManagement to reduce initial bundle size (Requirement 17.3)
const APIKeyManagement = dynamicImport(
  () => import('@/components/admin/APIKeyManagement').then((mod) => ({ default: mod.APIKeyManagement })),
  {
    loading: () => <SkeletonLoader />,
  }
);

/**
 * API Key Management Page
 * 
 * Displays all configured API keys in a table format with:
 * - Masked key display for security (e.g., "sk-...xyz")
 * - Provider information
 * - Created date and last used date
 * - "Add New Key" button for creating new keys
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 17.3
 */
export default async function APIKeysPage() {
  // Fetch all API keys from database
  const apiKeys = await prisma.aPIKey.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      provider: true,
      encryptedKey: true,
      createdAt: true,
      lastUsedAt: true,
      updatedAt: true,
    },
  });

  return <APIKeyManagement initialApiKeys={apiKeys} />;
}
