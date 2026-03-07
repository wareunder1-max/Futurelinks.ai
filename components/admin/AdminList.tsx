'use client';

/**
 * Admin List Component
 * 
 * Displays a table of all admin accounts with:
 * - Username
 * - Created date
 * - Last login date
 * - Current user indicator
 * 
 * Requirements: 12.1
 */

interface Admin {
  id: string;
  username: string;
  createdAt: Date;
  lastLoginAt: Date;
}

interface AdminListProps {
  admins: Admin[];
  currentUsername: string;
}

export function AdminList({ admins, currentUsername }: AdminListProps) {
  /**
   * Format date to readable string
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (admins.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No admin accounts found</p>
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
              Username
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
              Last Login
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {admins.map((admin) => {
            const isCurrentUser = admin.username === currentUsername;
            
            return (
              <tr key={admin.id} className={isCurrentUser ? 'bg-blue-50' : ''}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {admin.username}
                    </span>
                    {isCurrentUser && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(admin.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(admin.lastLoginAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
