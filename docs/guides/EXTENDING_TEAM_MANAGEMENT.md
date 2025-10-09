# 👥 Extending Team Management Guide

**Learn how to customize and extend SaaStastic's team management system with invitations, role management, and activity tracking.**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Team Management Overview](#team-management-overview)
3. [Customizing the Team Interface](#customizing-the-team-interface)
4. [Adding Custom User Fields](#adding-custom-user-fields)
5. [Invitation System Customization](#invitation-system-customization)
6. [Activity Tracking](#activity-tracking)
7. [Bulk Operations](#bulk-operations)
8. [Email Templates](#email-templates)
9. [Real-World Examples](#real-world-examples)

---

## Introduction

### What's Included

SaaStastic's team management system includes:
- ✅ **User invitation system** with email notifications
- ✅ **Role assignment** with permission management
- ✅ **Activity tracking** with comprehensive audit trail
- ✅ **Bulk operations** for managing multiple users
- ✅ **Real-time updates** with React Query
- ✅ **Permission-based UI** that adapts to user roles

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TeamMembersList` | `src/features/users/components/team-members-list.tsx` | Display and manage team |
| `InviteMemberModal` | `src/features/users/components/invite-member-modal.tsx` | Invite new members |
| `UserActivityDashboard` | `src/features/users/components/user-activity-dashboard.tsx` | View activity logs |

---

## Team Management Overview

### The Team Management Page

Located at `/dashboard/team`, includes 4 tabs:

```typescript
// src/app/dashboard/team/page.tsx
export default function TeamPage() {
  return (
    <Tabs defaultValue="members">
      <TabsList>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="members">
        <TeamMembersList />
      </TabsContent>
      
      {/* Other tabs... */}
    </Tabs>
  );
}
```

### Data Flow

```
User Action → API Route → Database → Real-time Update → UI
```

Example: Inviting a member
1. User fills invitation form
2. `POST /api/users/invitations` creates invitation
3. Email sent via Resend (or logged in dev)
4. UI updates with React Query invalidation
5. Activity log created automatically

---

## Customizing the Team Interface

### Adding Custom Columns

Extend the team member display:

```typescript
// src/features/users/components/team-members-list.tsx
interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  joinedAt: Date;
  lastActive?: Date;
  
  // Add your custom fields
  department?: string;
  jobTitle?: string;
  location?: string;
  phoneNumber?: string;
}

// Update the display
<div className="grid grid-cols-6 gap-4">
  <div>Name</div>
  <div>Email</div>
  <div>Role</div>
  <div>Department</div> {/* New column */}
  <div>Joined</div>
  <div>Actions</div>
</div>

{members.map(member => (
  <div key={member.id} className="grid grid-cols-6 gap-4">
    <div>{member.name}</div>
    <div>{member.email}</div>
    <div><RoleBadge role={member.role} /></div>
    <div>{member.department || 'Not set'}</div> {/* New field */}
    <div>{formatDate(member.joinedAt)}</div>
    <div><ActionMenu member={member} /></div>
  </div>
))}
```

### Custom Role Badges

Create styled badges for roles:

```typescript
// src/features/users/components/role-badge.tsx
import { Badge } from '@/shared/ui/badge';
import { Crown, Shield, User, Eye } from 'lucide-react';

export function RoleBadge({ role }: { role: Role }) {
  const config = {
    OWNER: {
      icon: Crown,
      label: 'Owner',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800',
    },
    ADMIN: {
      icon: Shield,
      label: 'Admin',
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800',
    },
    MEMBER: {
      icon: User,
      label: 'Member',
      variant: 'outline' as const,
      className: 'bg-green-100 text-green-800',
    },
    VIEWER: {
      icon: Eye,
      label: 'Viewer',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800',
    },
  };

  const { icon: Icon, label, className } = config[role];

  return (
    <Badge className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
```

### Adding Team Filters

Filter team members by role, status, or department:

```typescript
// src/features/users/components/team-filters.tsx
export function TeamFilters({
  onFilterChange,
}: {
  onFilterChange: (filters: TeamFilters) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | 'all'>('all');

  useEffect(() => {
    onFilterChange({
      role: selectedRole === 'all' ? undefined : selectedRole,
      search: searchQuery,
      department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    });
  }, [selectedRole, searchQuery, selectedDepartment]);

  return (
    <div className="flex gap-4 mb-6">
      {/* Search */}
      <Input
        placeholder="Search members..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-xs"
      />
      
      {/* Role filter */}
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value as Role | 'all')}
        className="rounded-md border px-3 py-2"
      >
        <option value="all">All Roles</option>
        <option value="OWNER">Owner</option>
        <option value="ADMIN">Admin</option>
        <option value="MEMBER">Member</option>
        <option value="VIEWER">Viewer</option>
      </select>
      
      {/* Department filter */}
      <select
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
        className="rounded-md border px-3 py-2"
      >
        <option value="all">All Departments</option>
        <option value="engineering">Engineering</option>
        <option value="sales">Sales</option>
        <option value="marketing">Marketing</option>
        <option value="support">Support</option>
      </select>
    </div>
  );
}
```

---

## Adding Custom User Fields

### Step 1: Update Database Schema

Add fields to the `User` model:

```prisma
// prisma/schema.prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  
  // Add custom fields
  jobTitle    String?
  department  String?
  phoneNumber String?
  location    String?
  bio         String?
  avatar      String?
  timezone    String?   @default("America/New_York")
  
  // Relations
  logs        EventLog[]
  feedback    Feedback[]
  companies   UserCompany[]
  invitations UserInvitation[]

  @@index([email])
  @@index([deletedAt])
  @@index([department]) // Index for filtering
}
```

### Step 2: Run Migration

```bash
npx prisma migrate dev --name add_user_profile_fields
```

### Step 3: Update API Routes

Expose new fields in the team API:

```typescript
// src/app/api/users/team/route.ts
export const GET = withPermissions(
  async (req: NextRequest, context) => {
    const { companyId } = context;

    const userCompanies = await db.userCompany.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            // Add new fields
            jobTitle: true,
            department: true,
            phoneNumber: true,
            location: true,
            avatar: true,
          },
        },
        roleRef: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const members = userCompanies.map(uc => ({
      id: uc.user.id,
      email: uc.user.email,
      name: uc.user.name,
      jobTitle: uc.user.jobTitle,
      department: uc.user.department,
      phoneNumber: uc.user.phoneNumber,
      location: uc.user.location,
      avatar: uc.user.avatar,
      role: uc.role,
      roleName: uc.roleRef?.name,
      joinedAt: uc.createdAt,
    }));

    return NextResponse.json({ members });
  },
  [PERMISSIONS.TEAM_VIEW]
);
```

### Step 4: Create Profile Edit Form

```typescript
// src/features/users/components/edit-profile-modal.tsx
export function EditProfileModal({
  member,
  open,
  onOpenChange,
}: {
  member: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    name: member.name || '',
    jobTitle: member.jobTitle || '',
    department: member.department || '',
    phoneNumber: member.phoneNumber || '',
    location: member.location || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch(`/api/users/${member.id}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      toast.success('Profile updated');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Job Title</Label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="e.g., Senior Developer"
            />
          </div>
          
          <div>
            <Label>Department</Label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select department</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="support">Support</option>
            </select>
          </div>
          
          <div>
            <Label>Phone Number</Label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Invitation System Customization

### Custom Invitation Emails

Replace the default email template:

```typescript
// src/features/users/services/email-templates.ts
export function getInvitationEmailHTML({
  inviterName,
  companyName,
  inviteLink,
  roleName,
  customMessage,
}: {
  inviterName: string;
  companyName: string;
  inviteLink: string;
  roleName: string;
  customMessage?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're invited to ${companyName}</h1>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            
            <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> as a <strong>${roleName}</strong>.</p>
            
            ${customMessage ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                <p style="margin: 0;"><em>"${customMessage}"</em></p>
              </div>
            ` : ''}
            
            <p>Click the button below to accept the invitation and create your account:</p>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
```

### Invitation Expiration Logic

Customize how long invitations are valid:

```typescript
// src/features/users/services/invitation-service.ts
export async function createInvitation({
  email,
  companyId,
  roleId,
  invitedBy,
  expiresInDays = 7, // Customizable
}: {
  email: string;
  companyId: string;
  roleId: string;
  invitedBy: string;
  expiresInDays?: number;
}) {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const invitation = await db.userInvitation.create({
    data: {
      email,
      companyId,
      roleId,
      invitedBy,
      token,
      expiresAt,
    },
  });

  return invitation;
}
```

### Resending Invitations

Allow users to resend expired invitations:

```typescript
// src/app/api/users/invitations/[token]/resend/route.ts
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    const { token } = context.params;
    
    // Find invitation
    const invitation = await db.userInvitation.findUnique({
      where: { token },
      include: {
        company: true,
        inviter: true,
        roleRef: true,
      },
    });
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Extend expiration
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);
    
    await db.userInvitation.update({
      where: { token },
      data: { expiresAt: newExpiresAt },
    });
    
    // Resend email
    await sendInvitationEmail({
      email: invitation.email,
      inviterName: invitation.inviter.name || 'A team member',
      companyName: invitation.company.name,
      roleName: invitation.roleRef?.name || 'Member',
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${token}`,
    });
    
    return NextResponse.json({ success: true });
  },
  [PERMISSIONS.TEAM_INVITE]
);
```

---

## Activity Tracking

### Custom Activity Types

Add your own activity types:

```typescript
// src/shared/lib/activity-types.ts
export const ACTIVITY_TYPES = {
  // Team activities
  USER_INVITED: 'user:invited',
  USER_JOINED: 'user:joined',
  USER_REMOVED: 'user:removed',
  ROLE_CHANGED: 'user:role:changed',
  
  // Your custom activities
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  DOCUMENT_SHARED: 'document:shared',
  EXPORT_GENERATED: 'export:generated',
} as const;
```

### Logging Activities

Log custom activities:

```typescript
// src/lib/actions/activity-logger.ts
export async function logActivity({
  action,
  userId,
  companyId,
  metadata,
  ipAddress,
  userAgent,
}: {
  action: string;
  userId: string;
  companyId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return db.eventLog.create({
    data: {
      action,
      userId,
      companyId,
      metadata,
      ipAddress,
      userAgent,
    },
  });
}

// Usage in your feature
await logActivity({
  action: ACTIVITY_TYPES.PROJECT_CREATED,
  userId: context.userId,
  companyId: context.companyId,
  metadata: {
    projectId: project.id,
    projectName: project.name,
  },
});
```

### Activity Feed Component

Display activity with custom formatting:

```typescript
// src/features/users/components/activity-feed.tsx
export function ActivityFeed({ companyId }: { companyId: string }) {
  const [activities, setActivities] = useState<EventLog[]>([]);

  useEffect(() => {
    fetchActivities();
  }, [companyId]);

  const getActivityIcon = (action: string) => {
    const icons: Record<string, any> = {
      'user:invited': UserPlus,
      'user:joined': LogIn,
      'user:removed': UserMinus,
      'user:role:changed': Shield,
      'project:created': FolderPlus,
      'document:shared': Share2,
    };
    return icons[action] || Activity;
  };

  const formatActivityMessage = (activity: EventLog) => {
    const metadata = activity.metadata as any;
    
    switch (activity.action) {
      case 'user:invited':
        return `invited ${metadata.email} as ${metadata.role}`;
      case 'project:created':
        return `created project "${metadata.projectName}"`;
      case 'document:shared':
        return `shared document with ${metadata.sharedWith}`;
      default:
        return activity.action;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map(activity => {
        const Icon = getActivityIcon(activity.action);
        
        return (
          <div key={activity.id} className="flex gap-4 items-start">
            <div className="p-2 bg-blue-100 rounded-full">
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>
                {' '}
                {formatActivityMessage(activity)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Bulk Operations

### Bulk Role Assignment

Update roles for multiple users:

```typescript
// src/app/api/users/team/bulk-role-update/route.ts
export const POST = withPermissions(
  async (req: NextRequest, context) => {
    const { userIds, roleId } = await req.json();
    const { companyId } = context;

    // Update all users
    await db.userCompany.updateMany({
      where: {
        userId: { in: userIds },
        companyId,
      },
      data: {
        roleId,
      },
    });

    // Log activity
    await logActivity({
      action: 'team:bulk:role:update',
      userId: context.userId,
      companyId,
      metadata: {
        userIds,
        roleId,
        count: userIds.length,
      },
    });

    return NextResponse.json({ success: true, updated: userIds.length });
  },
  [PERMISSIONS.TEAM_ROLE_UPDATE]
);
```

### Bulk User Removal

Remove multiple users at once:

```typescript
// UI Component
function BulkActionsToolbar({ selectedIds }: { selectedIds: string[] }) {
  const handleBulkRemove = async () => {
    const response = await fetch('/api/users/team/bulk-remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: selectedIds }),
    });

    if (response.ok) {
      toast.success(`Removed ${selectedIds.length} users`);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex gap-2 items-center p-4 bg-blue-50 rounded-lg">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      
      <Button size="sm" variant="outline" onClick={handleBulkRemove}>
        <Trash2 className="h-4 w-4 mr-2" />
        Remove Selected
      </Button>
    </div>
  );
}
```

---

## Email Templates

### Using Different Email Providers

Switch from Resend to SendGrid:

```typescript
// src/features/users/services/email-service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendInvitationEmail({
  to,
  inviterName,
  companyName,
  inviteLink,
  roleName,
}: InvitationEmailParams) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    subject: `You're invited to join ${companyName}`,
    html: getInvitationEmailHTML({
      inviterName,
      companyName,
      inviteLink,
      roleName,
    }),
  };

  await sgMail.send(msg);
}
```

---

## Real-World Examples

### Example 1: Department-Based Teams

```typescript
// Group users by department
export function DepartmentView({ companyId }: { companyId: string }) {
  const { data: members } = useQuery({
    queryKey: ['team', companyId],
    queryFn: () => fetchTeamMembers(companyId),
  });

  const groupedByDepartment = members?.reduce((acc, member) => {
    const dept = member.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDepartment || {}).map(([dept, deptMembers]) => (
        <div key={dept}>
          <h3 className="text-lg font-semibold mb-3">{dept}</h3>
          <div className="grid grid-cols-3 gap-4">
            {deptMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Onboarding Checklist

```typescript
// Track new member onboarding
export function OnboardingChecklist({ userId }: { userId: string }) {
  const steps = [
    { id: 'profile', label: 'Complete profile', check: (user) => !!user.name && !!user.avatar },
    { id: 'department', label: 'Set department', check: (user) => !!user.department },
    { id: 'first_project', label: 'Create first project', check: (user) => user.projectCount > 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome! Complete your onboarding</CardTitle>
      </CardHeader>
      <CardContent>
        {steps.map(step => (
          <div key={step.id} className="flex items-center gap-2">
            {step.check(user) ? <CheckCircle /> : <Circle />}
            <span>{step.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## Next Steps

- **[RBAC Usage Guide](./RBAC_USAGE.md)** - Permission system
- **[Customizing Permissions](./CUSTOMIZING_PERMISSIONS.md)** - Add custom permissions
- **[Stripe Customization](./STRIPE_CUSTOMIZATION.md)** - Billing customization

---

**Need Help?** 
- 📖 [Team Management Spec](../core/architecture/team-management-spec.md)
- 💬 [GitHub Discussions](https://github.com/your-org/saastastic/discussions)
- 📧 [Email Support](mailto:support@saastastic.com)

---

*Last updated: October 8, 2025*
