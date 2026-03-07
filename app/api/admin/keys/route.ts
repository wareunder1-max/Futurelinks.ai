import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { encryptAPIKey, decryptAPIKey } from '@/lib/encryption';

/**
 * API Routes for API Key Management
 * 
 * GET: List all API keys (encrypted by default, decrypted if decrypt=true query param)
 * POST: Create new API key
 * 
 * Requirements: 8.4, 9.5, 10.1, 10.2, 10.3
 */

/**
 * GET /api/admin/keys
 * List all API keys
 * 
 * Query params:
 * - decrypt: If 'true', decrypts keys before returning (Requirement 10.2)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    // Check if decryption is requested
    const shouldDecrypt = request.nextUrl.searchParams.get('decrypt') === 'true';

    // Fetch all API keys
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

    // Decrypt keys if requested (Requirement 10.2 - decrypt on retrieval)
    if (shouldDecrypt) {
      const decryptedKeys = apiKeys.map(key => {
        try {
          return {
            ...key,
            decryptedKey: decryptAPIKey(key.encryptedKey),
          };
        } catch (error) {
          console.error(`Error decrypting key ${key.id}:`, error);
          return {
            ...key,
            decryptedKey: null,
          };
        }
      });
      return NextResponse.json({ apiKeys: decryptedKeys });
    }

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch API keys',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/keys
 * Create new API key
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6
 */
export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { provider, keyValue } = body;

    // Validate required fields (Requirement 8.6)
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

    // Encrypt the API key (Requirement 10.2)
    const encryptedKey = encryptAPIKey(keyValue.trim());

    // Store in database (Requirement 8.4)
    const apiKey = await prisma.aPIKey.create({
      data: {
        provider: provider.trim(),
        encryptedKey,
      },
    });

    // Return success (Requirement 8.5)
    return NextResponse.json(
      {
        message: 'API key added successfully',
        apiKey: {
          id: apiKey.id,
          provider: apiKey.provider,
          createdAt: apiKey.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    
    // Handle storage failures (Requirement 10.3)
    return NextResponse.json(
      {
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to save API key. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
