/**
 * User Activity Dashboard Component
 * 
 * Displays audit logs, user activity, and team activity feeds
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar,
  User,
  Shield,
  CreditCard,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PermissionGuard } from '@/shared/components/permission-guard';
import { PERMISSIONS } from '@/shared/lib/permissions';

interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName?: string;
  userEmail: string;
  companyId: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface UserActivityDashboardProps {
  companyId?: string;
  userId?: string; // If provided, show activity for specific user
}

export function UserActivityDashboard({
  companyId,
  userId,
}: UserActivityDashboardProps) {
  const { hasPermission } = usePermissions();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');

  useEffect(() => {
    if (hasPermission(PERMISSIONS.SYSTEM_LOGS)) {
      fetchActivities();
    }
  }, [companyId, userId, filterType, dateRange]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(userId && { userId }),
        ...(filterType !== 'all' && { type: filterType }),
        dateRange,
      });

      const response = await fetch(`/api/audit/activities?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity data');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user_login':
      case 'user_logout':
        return <User className="h-4 w-4" />;
      case 'team_invite':
      case 'team_remove':
      case 'team_role_update':
        return <Users className="h-4 w-4" />;
      case 'billing_update':
      case 'subscription_change':
        return <CreditCard className="h-4 w-4" />;
      case 'company_settings':
        return <Settings className="h-4 w-4" />;
      case 'permission_change':
      case 'role_assign':
        return <Shield className="h-4 w-4" />;
      case 'security_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user_login':
      case 'team_invite':
      case 'subscription_change':
        return 'default';
      case 'team_remove':
      case 'user_logout':
        return 'secondary';
      case 'security_alert':
        return 'destructive';
      case 'permission_change':
      case 'role_assign':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredActivities = activities.filter(activity =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasPermission(PERMISSIONS.SYSTEM_LOGS)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Dashboard
          </CardTitle>
          <CardDescription>
            You don&apos;t have permission to view activity logs. If you need access, please contact your administrator.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {userId ? 'User Activity' : 'Team Activity Dashboard'}
              </CardTitle>
              <CardDescription>
                {userId 
                  ? 'Activity history for selected user'
                  : 'Monitor team activity and audit logs'
                }
              </CardDescription>
            </div>
            <Button onClick={fetchActivities} disabled={isLoading}>
              <Activity className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Activities</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by description, user, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filter">Filter by Type</Label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Types</option>
                <option value="user_login">User Login</option>
                <option value="team_invite">Team Invites</option>
                <option value="team_remove">Team Removals</option>
                <option value="role_assign">Role Changes</option>
                <option value="billing_update">Billing</option>
                <option value="security_alert">Security</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Activity Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No activity found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'No activity has been recorded yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActivityBadgeVariant(activity.type) as "default" | "secondary" | "destructive" | "outline"}>
                        {formatEventType(activity.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={`https://avatar.vercel.sh/${activity.userEmail}`} />
                          <AvatarFallback>
                            {activity.userName?.[0] || activity.userEmail[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.userName || activity.userEmail}</span>
                      </div>
                      
                      {activity.ipAddress && (
                        <span>IP: {activity.ipAddress}</span>
                      )}
                      
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <PermissionGuard permission={PERMISSIONS.SYSTEM_LOGS}>
                          <details className="cursor-pointer">
                            <summary className="hover:text-foreground">Details</summary>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        </PermissionGuard>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
