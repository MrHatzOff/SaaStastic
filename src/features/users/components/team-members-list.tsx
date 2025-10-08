'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { MoreHorizontal, Trash2, UserPlus, Shield, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';
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
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PERMISSIONS } from '@/shared/lib/permissions';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  joinedAt: Date;
  lastActive?: Date;
  roleName?: string;
}

interface TeamMembersListProps {
  companyId: string;
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
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, [companyId]);

  // Ensure dialog closes when loading or member selection changes
  useEffect(() => {
    if (isLoading || !selectedMember) {
      setShowRemoveDialog(false);
    }
  }, [isLoading, selectedMember]);

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

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/users/team/${selectedMember.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      toast.success(`${selectedMember.name || selectedMember.email} removed from team`);
      setShowRemoveDialog(false);
      setSelectedMember(null);
      await fetchTeamMembers();
    } catch (error: unknown) {
      console.error('Error removing member:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/users/team/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
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

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="h-3 w-3" />;
      case 'ADMIN':
        return <Settings className="h-3 w-3" />;
      case 'MEMBER':
        return <UserPlus className="h-3 w-3" />;
      case 'VIEWER':
        return <Eye className="h-3 w-3" />;
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

  const canRemoveMember = (member: TeamMember): boolean => {
    if (member.id === currentUserId) return false;
    if (!hasPermission(PERMISSIONS.TEAM_REMOVE)) return false;
    if (member.role === 'OWNER' && currentUserRole !== 'OWNER') return false;
    return true;
  };

  const canManageRole = (_memberRole: Role): boolean => {
    if (!hasPermission(PERMISSIONS.TEAM_ROLE_UPDATE)) return false;
    if (currentUserRole !== 'OWNER') return false;
    return true;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Loading team members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team members and their roles
            </CardDescription>
          </div>
          {hasPermission(PERMISSIONS.TEAM_INVITE) && (
            <Button onClick={onInviteClick}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Members
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
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

      <AlertDialog 
        open={showRemoveDialog && selectedMember !== null && !isLoading}
        onOpenChange={(open) => {
          if (open && (!selectedMember || isLoading)) {
            return;
          }
          setShowRemoveDialog(open);
        }}
      >
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
    </>
  );
}
