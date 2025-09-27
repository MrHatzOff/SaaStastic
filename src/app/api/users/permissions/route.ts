/**
 * User Permissions API Route
 * 
 * GET /api/users/permissions - Get current user's permissions for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/shared/lib/rbac-middleware';

export const GET = withPermissions(
  async (req: NextRequest, context) => {
    try {
      // Return user's permissions from the authenticated context
      return NextResponse.json({
        permissions: context.permissions,
        user: context.user,
        company: context.company,
      });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      );
    }
  }
  // No specific permissions required - just authentication
);
