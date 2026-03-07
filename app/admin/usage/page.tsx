import dynamic from 'next/dynamic';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// Dynamic import for UsageDashboard to reduce initial bundle size (Requirement 17.3)
const UsageDashboard = dynamic(
  () => import('@/components/admin/UsageDashboard').then((mod) => ({ default: mod.UsageDashboard })),
  {
    loading: () => <SkeletonLoader />,
  }
);

/**
 * Usage Dashboard Page
 * 
 * Displays aggregated usage metrics from the UsageLog table with:
 * - Table with columns: Provider, Total Requests, Last Used
 * - Sortable columns
 * - Date range filtering
 * - Real-time updates via polling (5 seconds)
 * 
 * Requirements: 11.2, 11.3, 11.4, 11.5, 17.3
 */
export default function UsagePage() {
  return <UsageDashboard />;
}
