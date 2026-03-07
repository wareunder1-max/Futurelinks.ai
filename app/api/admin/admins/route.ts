import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/**
 * API Routes for Admin Account Management
 * 
 * GET: List all admin accounts
 * POST: Create new admin account
 * 
 * Requirements: 12.2, 12.3, 12.4, 12.6, 12.7
 */

/**
 * GET /api/admin/admins
 * List all admin accounts
 * 
 * Requirements: 12.1, 12.2
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

    // Fetch all admin accounts (excluding password hashes)
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

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Error fetching admin accounts:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch admin accounts',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/admins
 * Create new admin account
 * 
 * Requirements: 12.2, 12.3, 12.4, 12.6, 12.7
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
    const { username, password } = body;

    // Validate username (Requirement 12.3)
    if (!username || username.trim() === '') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate password length (Requirement 12.4, 12.7)
    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 8 characters',
          },
        },
        { status: 400 }
      );
    }

    // Check username uniqueness (Requirement 12.3)
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username already exists',
          },
        },
        { status: 400 }
      );
    }

    // Hash password before storage (Requirement 12.6)
    const passwordHash = await hashPassword(password);

    // Create admin account (Requirement 12.2)
    const admin = await prisma.admin.create({
      data: {
        username: username.trim(),
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    // Return success
    return NextResponse.json(
      {
        message: 'Admin account created successfully',
        admin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin account:', error);
    
    // Handle storage failures
    return NextResponse.json(
      {
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to create admin account. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
