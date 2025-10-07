/**
 * Invite Member Modal Component
 * 
 * Provides UI for inviting new team members with role assignment
 */

'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
// Note: Using native select for now - can upgrade to Radix UI later
import { Badge } from '@/shared/ui/badge';
import { Mail, UserPlus, X, Shield, Crown, Eye, User } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { PERMISSIONS } from '@/shared/lib/permissions';
import type { Role } from '@prisma/client';
import { z } from 'zod';

const inviteSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email is required'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
  message: z.string().optional(),
});

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSuccess?: () => void;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  onInviteSuccess,
}: InviteMemberModalProps) {
  const { hasPermission } = usePermissions();
  const [emails, setEmails] = useState<string[]>(['']);
  const [selectedRole, setSelectedRole] = useState<Role>('MEMBER');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(PERMISSIONS.TEAM_INVITE)) {
      toast.error('You do not have permission to invite team members');
      return;
    }

    setIsLoading(true);
    
    try {
      // Filter out empty emails and validate
      const validEmails = emails.filter(email => email.trim() !== '');
      
      const validationResult = inviteSchema.safeParse({
        emails: validEmails,
        role: selectedRole,
        message: message.trim() || undefined,
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues[0]?.message || 'Invalid input';
        toast.error(errorMessage);
        return;
      }

      const response = await fetch('/api/users/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationResult.data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitations');
      }

      const result = await response.json();
      
      toast.success(
        `Successfully sent ${result.sentCount} invitation${result.sentCount !== 1 ? 's' : ''}`
      );

      // Reset form
      setEmails(['']);
      setSelectedRole('MEMBER');
      setMessage('');
      onOpenChange(false);
      onInviteSuccess?.();

    } catch (error) {
      console.error('Error sending invitations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitations';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return 'Full access to all features including billing and team management';
      case 'ADMIN':
        return 'Administrative access with team management and most features';
      case 'MEMBER':
        return 'Standard access to core features and customer management';
      case 'VIEWER':
        return 'Read-only access to view data and reports';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Send invitations to new team members. They&apos;ll receive an email with instructions to join your team.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col max-h-[calc(90vh-8rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          {/* Email Addresses */}
          <div className="space-y-3">
            <Label htmlFor="emails">Email Addresses</Label>
            {emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    required={index === 0}
                  />
                </div>
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmailField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailField}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Add Another Email
            </Button>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {(['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'] as Role[]).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            
            {/* Role Description */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {getRoleIcon(selectedRole)}
                <span className="font-medium text-sm">{selectedRole} Role</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(selectedRole)}
              </p>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview */}
          {emails.some(email => email.trim() !== '') && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-sm mb-2">Invitation Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Recipients:</span>
                  <div className="flex flex-wrap gap-1">
                    {emails.filter(email => email.trim() !== '').map((email, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="text-xs">
                    {getRoleIcon(selectedRole)}
                    <span className="ml-1">{selectedRole}</span>
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitations'}
            </Button>
          </DialogFooter>
        </form>
      </div>
      </DialogContent>
    </Dialog>
  );
}
