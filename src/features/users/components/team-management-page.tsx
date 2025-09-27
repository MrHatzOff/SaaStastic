/**
 * Team Management Page Component
 * 
 * Comprehensive team management interface with RBAC integration
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Users, UserPlus, Activity, Settings, Shield } from 'lucide-react';
import { TeamMembersList } from './team-members-list';
import { InviteMemberModal } from './invite-member-modal';
import { UserActivityDashboard } from './user-activity-dashboard';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PermissionGuard } from '@/shared/components/permission-guard';
import { PERMISSIONS } from '@/shared/lib/permissions';
import type { Role } from '@prisma/client';

interface TeamManagementPageProps {
  currentUserId: string;
  currentUserRole: Role;
  companyId?: string;
}

export function TeamManagementPage({
  currentUserId,
  currentUserRole,
  companyId,
}: TeamManagementPageProps) {
  const { hasPermission } = usePermissions();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleInviteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleInviteClick = () => {
    setShowInviteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members, roles, and permissions
          </p>
        </div>
        
        <PermissionGuard permission={PERMISSIONS.TEAM_INVITE}>
          <Button onClick={handleInviteClick}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </PermissionGuard>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          
          <PermissionGuard permission={PERMISSIONS.SYSTEM_LOGS}>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.ROLE_VIEW}>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.TEAM_SETTINGS}>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </PermissionGuard>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <TeamMembersList
            key={refreshKey}
            companyId={companyId}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onInviteClick={handleInviteClick}
          />
        </TabsContent>

        {/* Activity Tab */}
        <PermissionGuard permission={PERMISSIONS.SYSTEM_LOGS}>
          <TabsContent value="activity" className="space-y-4">
            <UserActivityDashboard companyId={companyId} />
          </TabsContent>
        </PermissionGuard>

        {/* Roles & Permissions Tab */}
        <PermissionGuard permission={PERMISSIONS.ROLE_VIEW}>
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Roles & Permissions Overview
                </CardTitle>
                <CardDescription>
                  View and manage role-based permissions for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Owner Role */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <h3 className="font-semibold">Owner</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Full access to all features including billing and team management
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs text-green-600">✓ All permissions</div>
                      <div className="text-xs text-green-600">✓ Billing access</div>
                      <div className="text-xs text-green-600">✓ Team management</div>
                      <div className="text-xs text-green-600">✓ Company settings</div>
                    </div>
                  </div>

                  {/* Admin Role */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <h3 className="font-semibold">Admin</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Administrative access with team management and most features
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs text-green-600">✓ Team management</div>
                      <div className="text-xs text-green-600">✓ Customer management</div>
                      <div className="text-xs text-green-600">✓ Reports & analytics</div>
                      <div className="text-xs text-red-500">✗ Billing access</div>
                    </div>
                  </div>

                  {/* Member Role */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <h3 className="font-semibold">Member</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Standard access to core features and customer management
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs text-green-600">✓ Customer management</div>
                      <div className="text-xs text-green-600">✓ Basic reports</div>
                      <div className="text-xs text-red-500">✗ Team management</div>
                      <div className="text-xs text-red-500">✗ Billing access</div>
                    </div>
                  </div>

                  {/* Viewer Role */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <h3 className="font-semibold">Viewer</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Read-only access to view data and reports
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs text-green-600">✓ View customers</div>
                      <div className="text-xs text-green-600">✓ View reports</div>
                      <div className="text-xs text-red-500">✗ Edit data</div>
                      <div className="text-xs text-red-500">✗ Team management</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Permission System</h4>
                  <p className="text-sm text-blue-700">
                    SaaStastic uses a comprehensive RBAC system with 29 granular permissions across 7 categories. 
                    Each role has a predefined set of permissions, but custom roles can be created with specific permission combinations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </PermissionGuard>

        {/* Settings Tab */}
        <PermissionGuard permission={PERMISSIONS.TEAM_SETTINGS}>
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Team Settings
                </CardTitle>
                <CardDescription>
                  Configure team-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Invitation Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Invitation Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Auto-approve invitations</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically approve team member invitations without manual review
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked={true}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Email notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Send email notifications for team changes and invitations
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Require 2FA for admins</h4>
                          <p className="text-sm text-muted-foreground">
                            Require two-factor authentication for admin and owner roles
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded"
                          defaultChecked={false}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Session timeout</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically log out inactive users after specified time
                          </p>
                        </div>
                        <select className="rounded border px-3 py-1">
                          <option value="1h">1 hour</option>
                          <option value="8h">8 hours</option>
                          <option value="24h" selected>24 hours</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </PermissionGuard>
      </Tabs>

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}
