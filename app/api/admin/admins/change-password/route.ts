import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';

/**
 * API Route for Admin Password Change
 * 
 * PUT: Change current admin's password
 * 
 * Requirements: 12.5, 12.6, 12.7
 */

/**
 * PUT /api/admin/admins/change-password
 * Change current admin's password
 * 
 * Requirements: 12.5, 12.6, 12.7
 */
export async function PUT(request: NextRequest) {
  try {
    // Validate admin session (Requirement 12.5)
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    // Get admin ID from session
    const adminId = session.user.id;
    if (!adminId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate current password is provided
    if (!currentPassword) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Current password is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate new password length (Requirement 12.7)
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'New password must be at least 8 characters',
          },
        },
        { status: 400 }
      );
    }

    // Fetch current admin account
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Admin account not found',
          },
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Current password is incorrect',
          },
        },
        { status: 400 }
      );
    }

    // Hash new password before storage (Requirement 12.6)
    const newPasswordHash = await hashPassword(newPassword);

    // Update admin password (Requirement 12.5)
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Return success
    return NextResponse.json(
      {
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing admin password:', error);
    
    // Handle storage failures
    return NextResponse.json(
      {
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to change password. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
