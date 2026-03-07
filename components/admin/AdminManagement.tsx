'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AdminList } from './AdminList';
import { CreateAdminModal } from './CreateAdminModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { SuccessToast } from './SuccessToast';

/**
 * Admin Management Component
 * 
 * Manages the admin accounts page with:
 * - List of all admin accounts
 * - Create Admin button that opens modal
 * - Change Password button for current admin
 * - Success toast notification after operations
 * - Automatic refresh after successful operations
 * 
 * Requirements: 12.1, 12.2
 */

interface Admin {
  id: string;
  username: string;
  createdAt: Date;
  lastLoginAt: Date;
}

interface AdminManagementProps {
  initialAdmins: Admin[];
}

export function AdminManagement({ initialAdmins }: AdminManagementProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handles successful admin creation
   * Requirements: 12.2
   */
  const handleCreateSuccess = () => {
    setSuccessMessage('Admin account created successfully');
    setShowSuccessToast(true);
    setIsCreateModalOpen(false);
    // Refresh the page to show the new admin
    router.refresh();
  };

  /**
   * Handles successful password change
   * Requirements: 12.5
   */
  const handlePasswordChangeSuccess = () => {
    setSuccessMessage('Password changed successfully');
    setShowSuccessToast(true);
    setIsChangePasswordModalOpen(false);
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Accounts</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage administrator accounts and change your password
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Create Admin
            </button>
          </div>
        </div>

        <div className="mt-8">
          <AdminList 
            admins={initialAdmins}
            currentUsername={session?.user?.name || session?.user?.email || ''}
          />
        </div>
      </div>

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={handlePasswordChangeSuccess}
      />

      {/* Success Toast */}
      <SuccessToast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}
