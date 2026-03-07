import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { encryptAPIKey, decryptAPIKey } from '@/lib/encryption';

/**
 * API Routes for Individual API Key Management
 * 
 * GET: Retrieve single API key with decrypted value
 * PUT: Update existing API key
 * DELETE: Delete API key
 * 
 * Requirements: 9.5, 10.1, 10.2, 10.3, 15.3, 15.4, 15.5
 */

/**
 * GET /api/admin/keys/[id]
 * Retrieve single API key with decrypted value for editing
 * Requirements: 9.2, 10.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin session
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch the API key
    const apiKey = await prisma.aPIKey.findUnique({
      where: { id },
      select: {
        id: true,
        provider: true,
        encryptedKey: true,
        createdAt: true,
        lastUsedAt: true,
        updatedAt: true,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        },
        { status: 404 }
      );
    }

    // Decrypt the key for editing (Requirement 10.2 - decrypt on retrieval)
    try {
      const decryptedKey = decryptAPIKey(apiKey.encryptedKey);
      return NextResponse.json({
        apiKey: {
          ...apiKey,
          decryptedKey,
        },
      });
    } catch (error) {
      console.error('Error decrypting API key:', error);
      return NextResponse.json(
        {
          error: {
            code: 'DECRYPTION_ERROR',
            message: 'Failed to decrypt API key',
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch API key',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/keys/[id]
 * Update existing API key
 * Requirements: 9.3, 9.4, 9.5, 9.6
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin session
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { provider, keyValue } = body;

    // Validate required fields
    if (!provider || provider.trim() === '') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provider name is required',
          },
        },
        { status: 400 }
      );
    }

    if (!keyValue || keyValue.trim() === '') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'API key value is required',
          },
        },
        { status: 400 }
      );
    }

    // Check if API key exists
    const existingKey = await prisma.aPIKey.findUnique({
      where: { id },
    });

    if (!existingKey) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        },
        { status: 404 }
      );
    }

    // Encrypt the new API key value (Requirement 10.2)
    const encryptedKey = encryptAPIKey(keyValue.trim());

    // Update in database (Requirement 9.5)
    const updatedKey = await prisma.aPIKey.update({
      where: { id },
      data: {
        provider: provider.trim(),
        encryptedKey,
      },
    });

    // Return success (Requirement 9.6)
    return NextResponse.json(
      {
        message: 'API key updated successfully',
        apiKey: {
          id: updatedKey.id,
          provider: updatedKey.provider,
          updatedAt: updatedKey.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating API key:', error);
    
    // Handle storage failures (Requirement 10.3)
    return NextResponse.json(
      {
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to update API key. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/keys/[id]
 * Delete API key and associated usage logs
 * Requirements: 15.3, 15.4, 15.5
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin session
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if API key exists
    const existingKey = await prisma.aPIKey.findUnique({
      where: { id },
    });

    if (!existingKey) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        },
        { status: 404 }
      );
    }

    // Delete API key (cascade will handle UsageLog deletion)
    await prisma.aPIKey.delete({
      where: { id },
    });

    // Return success
    return NextResponse.json(
      {
        message: 'API key deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to delete API key. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
