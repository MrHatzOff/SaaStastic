'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { MoreHorizontal, UserPlus, Shield, Crown, Eye, User, Trash2, Mail, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PermissionGuard } from '@/shared/components/permission-guard';
import { PERMISSIONS } from '@/shared/lib/permissions';
import type { Role } from '@prisma/client';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  roleId?: string | null;
  roleName?: string;
  joinedAt: Date;
  lastActive?: Date;
  permissions: string[]; // Array of permission keys
}

interface TeamMembersListProps {
  companyId?: string;
  currentUserId: string;
  currentUserRole: Role;
  onInviteClick?: () => void;
}

export function TeamMembersList({
  companyId,
  currentUserId,
  currentUserRole,
  onInviteClick,
}: TeamMembersListProps) {
  const { hasPermission } = usePermissions();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, [companyId]);

  // Reset bulk dialog state when no members are selected or component is loading
  useEffect(() => {
    if (selectedMembers.length === 0 && showBulkRemoveDialog) {
      setShowBulkRemoveDialog(false);
    }
  }, [selectedMembers.length, showBulkRemoveDialog]);

  // Force close bulk dialog when component mounts or members change
  useEffect(() => {
    if (members.length === 0 || selectedMembers.length === 0) {
      setShowBulkRemoveDialog(false);
    }
  }, [members, selectedMembers.length]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/team');
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/users/team/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      toast.success('Role updated successfully');
      await fetchTeamMembers();
    } catch (error: unknown) {
      console.error('Error updating role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/users/team/${selectedMember.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      toast.success('Team member removed successfully');
      setShowRemoveDialog(false);
      setSelectedMember(null);
      await fetchTeamMembers();
    } catch (error: unknown) {
      console.error('Error removing member:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove team member';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedMembers.length === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/users/team/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: selectedMembers }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove members');
      }

      toast.success(`${selectedMembers.length} team members removed successfully`);
      setShowBulkRemoveDialog(false);
      setSelectedMembers([]);
      await fetchTeamMembers();
    } catch (error: unknown) {
      console.error('Error removing members:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove team members';
      toast.error(errorMessage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableMembers = members.filter(member => 
        member.id !== currentUserId && canRemoveMember(member)
      );
      setSelectedMembers(selectableMembers.map(m => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'MEMBER':
        return <User className="h-4 w-4" />;
      case 'VIEWER':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      case 'MEMBER':
        return 'outline';
      case 'VIEWER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const canManageRole = (targetRole: Role) => {
    // Must have role assignment permission
    if (!hasPermission(PERMISSIONS.ROLE_ASSIGN)) return false;
    
    if (targetRole === 'OWNER') {
      // Check if there are other owners
      const ownerCount = members.filter(m => m.role === 'OWNER').length;
      return ownerCount > 1 && hasPermission(PERMISSIONS.TEAM_ROLE_UPDATE);
    }
    return hasPermission(PERMISSIONS.TEAM_ROLE_UPDATE);
  };

  const canRemoveMember = (member: TeamMember) => {
    if (member.id === currentUserId) return false; // Can't remove yourself
    if (!hasPermission(PERMISSIONS.TEAM_REMOVE)) return false;
    
    if (member.role === 'OWNER') {
      const ownerCount = members.filter(m => m.role === 'OWNER').length;
      return ownerCount > 1 && hasPermission(PERMISSIONS.TEAM_ROLE_UPDATE);
    }
    return true;
  };

  const canInviteMembers = () => {
    return hasPermission(PERMISSIONS.TEAM_INVITE);
  };

  const canViewTeam = () => {
    return hasPermission(PERMISSIONS.TEAM_VIEW);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {members.length} {members.length === 1 ? 'member' : 'members'} in your team
                {selectedMembers.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {selectedMembers.length} selected
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedMembers.length > 0 && (
                <PermissionGuard permission={PERMISSIONS.TEAM_REMOVE}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkRemoveDialog(true)}
                    disabled={bulkActionLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove {selectedMembers.length}
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission={PERMISSIONS.TEAM_INVITE}>
                <Button onClick={onInviteClick}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Selection Header */}
          {hasPermission(PERMISSIONS.TEAM_REMOVE) && members.length > 1 && (
            <div className="flex items-center gap-2 pb-4 border-b mb-4">
              <input
                type="checkbox"
                className="rounded"
                checked={selectedMembers.length > 0 && selectedMembers.length === members.filter(m => m.id !== currentUserId && canRemoveMember(m)).length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">
                Select all removable members
              </span>
            </div>
          )}
          
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  selectedMembers.includes(member.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Selection Checkbox */}
                  {hasPermission(PERMISSIONS.TEAM_REMOVE) && member.id !== currentUserId && canRemoveMember(member) && (
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => handleSelectMember(member.id, e.target.checked)}
                    />
                  )}
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                    <AvatarFallback>
                      {member.name?.[0] || member.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {member.name || member.email}
                      </p>
                      {member.id === currentUserId && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      {member.lastActive && (
                        <span>Last active {new Date(member.lastActive).toLocaleDateString()}</span>
                      )}
                      {member.roleName && member.roleName !== member.role && (
                        <span className="text-blue-600">Custom role: {member.roleName}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role) as "default" | "secondary" | "destructive" | "outline"}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>
                  </Badge>

                  {(hasPermission(PERMISSIONS.TEAM_ROLE_UPDATE) || hasPermission(PERMISSIONS.TEAM_REMOVE)) && 
                    member.id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={actionLoading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {canManageRole(member.role) && (
                          <>
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Change Role
                            </DropdownMenuLabel>
                            {(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as Role[]).map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => handleRoleChange(member.id, role)}
                                disabled={member.role === role}
                              >
                                <span className="flex items-center gap-2">
                                  {getRoleIcon(role)}
                                  {role}
                                </span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                          </>
                        )}

                        {canRemoveMember(member) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRemoveDialog(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from team
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{selectedMember?.name || selectedMember?.email}</strong> from the team?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showBulkRemoveDialog && selectedMembers.length > 0 && members.length > 0 && !isLoading}
        onOpenChange={(open) => {
          // Only allow opening if we have selections, members loaded, and aren't loading
          if (open && (selectedMembers.length === 0 || members.length === 0 || isLoading)) {
            return;
          }
          setShowBulkRemoveDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Multiple Team Members</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedMembers.length}</strong> team members?
              This action cannot be undone.
            </AlertDialogDescription>
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              <strong>Members to be removed:</strong>
              <ul className="mt-1 space-y-1">
                {selectedMembers.map(memberId => {
                  const member = members.find(m => m.id === memberId);
                  return (
                    <li key={memberId} className="flex items-center gap-2">
                      • {member?.name || member?.email}
                    </li>
                  );
                })}
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRemove}
              disabled={bulkActionLoading}
              className="bg-destructive text-destructive-foreground"
            >
              Remove {selectedMembers.length} Members
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
