import { prisma } from '@/lib/prisma';
import dynamicImport from 'next/dynamic';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

// Dynamic import for AdminManagement to reduce initial bundle size (Requirement 17.3)
const AdminManagement = dynamicImport(
  () => import('@/components/admin/AdminManagement').then((mod) => ({ default: mod.AdminManagement })),
  {
    loading: () => <SkeletonLoader />,
  }
);

/**
 * Admin Management Page
 * 
 * Displays all admin accounts and provides UI for:
 * - Viewing list of admin accounts
 * - Creating new admin accounts
 * - Changing password for current admin
 * 
 * Requirements: 12.1, 12.2, 17.3
 */
export default async function AdminsPage() {
  // Fetch all admin accounts from database
  const admins = await prisma.admin.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return <AdminManagement initialAdmins={admins} />;
}
