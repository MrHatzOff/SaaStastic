import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/core/db/client';

/**
 * POST /api/auth/sync-user
 * 
 * Syncs Clerk user data with our database.
 * Called after user signs up or when we need to ensure user exists.
 */
export const POST = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User already exists'
      });
    }

    // Get user data from Clerk
    const email = user?.emailAddresses?.[0]?.emailAddress || 'unknown@example.com';
    const name = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.firstName || null;

    // Create user in our database
    const newUser = await db.user.create({
      data: {
        id: userId,
        email,
        name,
      },
    });

    // TODO: Add proper logging for user sync
    // console.log('User synced to database:', newUser.id);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error: unknown) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
