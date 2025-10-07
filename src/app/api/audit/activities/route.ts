/**
 * Audit Activities API Route
 * 
 * GET /api/audit/activities - Fetch activity logs and audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/shared/lib/rbac-middleware';
import { PERMISSIONS } from '@/shared/lib/permissions';
import { db } from '@/core/db/client';
import { z } from 'zod';

const activitiesQuerySchema = z.object({
  userId: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  dateRange: z.enum(['1d', '7d', '30d', '90d']).nullable().default('7d'),
  limit: z.coerce.number().min(1).max(100).nullable().default(50),
  offset: z.coerce.number().min(0).nullable().default(0),
});

export const GET = withPermissions(
  async (req: NextRequest, context) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = activitiesQuerySchema.parse({
        userId: searchParams.get('userId'),
        type: searchParams.get('type'),
        dateRange: searchParams.get('dateRange'),
        limit: searchParams.get('limit'),
        offset: searchParams.get('offset'),
      });

      // Calculate date filter
      const now = new Date();
      const dateFilter = new Date();
      switch (query.dateRange) {
        case '1d':
          dateFilter.setDate(now.getDate() - 1);
          break;
        case '7d':
          dateFilter.setDate(now.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(now.getDate() - 30);
          break;
        case '90d':
          dateFilter.setDate(now.getDate() - 90);
          break;
      }

      // Build where clause
      const whereClause: {
        companyId: string;
        createdAt: { gte: Date };
        userId?: string;
        action?: string;
      } = {
        companyId: context.companyId,
        createdAt: {
          gte: dateFilter,
        },
      };

      if (query.userId && query.userId !== null) {
        whereClause.userId = query.userId;
      }

      if (query.type && query.type !== null) {
        whereClause.action = query.type;
      }

      // Fetch activities
      const activities = await db.eventLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: query.limit || 50,
        skip: query.offset || 0,
      });

      // Get total count for pagination
      const totalCount = await db.eventLog.count({
        where: whereClause,
      });

      // Transform the data
      const transformedActivities = activities.map(activity => ({
        id: activity.id,
        type: activity.action,
        description: activity.action,
        userId: activity.userId,
        userName: activity.user?.name,
        userEmail: activity.user?.email || 'Unknown',
        companyId: activity.companyId,
        createdAt: activity.createdAt,
        metadata: activity.metadata,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
      }));

      return NextResponse.json({
        activities: transformedActivities,
        pagination: {
          total: totalCount,
          limit: query.limit || 50,
          offset: query.offset || 0,
          hasMore: (query.offset || 0) + (query.limit || 50) < totalCount,
        }
      });

    } catch (error) {
      console.error('Fetch activities error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.issues },
          { status: 400 }
        );
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch activities';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  },
  [PERMISSIONS.SYSTEM_LOGS]
);
