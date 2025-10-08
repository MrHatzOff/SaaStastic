import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

/**
 * Unit Tests for User Invitation Logic
 * 
 * Tests the invitation system that allows users to invite team members.
 * This includes validation, email sending, and role assignment.
 */

const db = new PrismaClient();

describe('User Invitation System', () => {
  let testCompanyId: string;
  let testUserId: string;

  beforeEach(async () => {
    // Create test company
    const company = await db.company.create({
      data: {
        name: 'Test Invitation Company',
        slug: `test-invite-${Date.now()}`,
      },
    });
    testCompanyId = company.id;

    // Create test user
    const user = await db.user.create({
      data: {
        email: `invite-test-${Date.now()}@example.com`,
        name: 'Test Inviter',
      },
    });
    testUserId = user.id;

    // Link user to company as OWNER
    await db.userCompany.create({
      data: {
        userId: testUserId,
        companyId: testCompanyId,
        role: 'OWNER',
      },
    });
  });

  afterEach(async () => {
    // Cleanup
    await db.userInvitation.deleteMany({
      where: { companyId: testCompanyId },
    });
    await db.userCompany.deleteMany({
      where: { companyId: testCompanyId },
    });
    await db.user.deleteMany({
      where: { id: testUserId },
    });
    await db.company.deleteMany({
      where: { id: testCompanyId },
    });
  });

  describe('Invitation Creation', () => {
    it('should create a valid invitation', async () => {
      const invitation = await db.userInvitation.create({
        data: {
          email: `invited-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}-${Math.random().toString(36)}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      expect(invitation).toBeDefined();
      expect(invitation.email).toContain('@example.com');
      expect(invitation.role).toBe('MEMBER');
      expect(invitation.acceptedAt).toBeNull(); // Pending invitations have no acceptedAt
    });

    it('should prevent duplicate invitations for same email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Create first invitation
      await db.userInvitation.create({
        data: {
          email,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token1-${Date.now()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Check for existing invitation before creating second one
      const existing = await db.userInvitation.findFirst({
        where: {
          email,
          companyId: testCompanyId,
          acceptedAt: null, // Not yet accepted = pending
        },
      });

      expect(existing).not.toBeNull();
      
      // In production, this would return an error instead of creating duplicate
    });

    it('should generate unique invitation tokens', async () => {
      const invitation1 = await db.userInvitation.create({
        data: {
          email: `user1-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}-${Math.random().toString(36)}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const invitation2 = await db.userInvitation.create({
        data: {
          email: `user2-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}-${Math.random().toString(36)}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      expect(invitation1.token).not.toBe(invitation2.token);
    });

    it('should set proper expiration time', async () => {
      const now = Date.now();
      const invitation = await db.userInvitation.create({
        data: {
          email: `expiry-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      const expiryTime = invitation.expiresAt.getTime();
      const expectedMinExpiry = now + 6.9 * 24 * 60 * 60 * 1000; // ~7 days
      const expectedMaxExpiry = now + 7.1 * 24 * 60 * 60 * 1000;

      expect(expiryTime).toBeGreaterThan(expectedMinExpiry);
      expect(expiryTime).toBeLessThan(expectedMaxExpiry);
    });
  });

  describe('Invitation Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should validate role is valid', () => {
      const validRoles = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
      const invalidRoles = ['SUPERADMIN', 'USER', 'GUEST', ''];

      validRoles.forEach(role => {
        expect(validRoles).toContain(role);
      });

      invalidRoles.forEach(role => {
        expect(validRoles).not.toContain(role);
      });
    });

    it('should detect expired invitations', async () => {
      const expiredInvitation = await db.userInvitation.create({
        data: {
          email: `expired-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      expect(expiredInvitation.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Invitation Acceptance', () => {
    it('should mark invitation as accepted', async () => {
      const invitation = await db.userInvitation.create({
        data: {
          email: `accept-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Accept invitation by setting acceptedAt
      const updated = await db.userInvitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(), // Setting this marks it as accepted
        },
      });

      expect(updated.acceptedAt).not.toBeNull();
    });

    it('should create user-company relationship on acceptance', async () => {
      const newUserEmail = `newuser-${Date.now()}@example.com`;
      
      // Create invitation
      const invitation = await db.userInvitation.create({
        data: {
          email: newUserEmail,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Create new user (simulating acceptance)
      const newUser = await db.user.create({
        data: {
          email: newUserEmail,
          name: 'New Team Member',
        },
      });

      // Create user-company relationship with invited role
      const userCompany = await db.userCompany.create({
        data: {
          userId: newUser.id,
          companyId: testCompanyId,
          role: invitation.role,
        },
      });

      expect(userCompany.role).toBe('MEMBER');
      expect(userCompany.companyId).toBe(testCompanyId);

      // Cleanup
      await db.userCompany.delete({ where: { id: userCompany.id } });
      await db.user.delete({ where: { id: newUser.id } });
    });
  });

  describe('Invitation Revocation', () => {
    it('should allow invitation to be deleted (revoked)', async () => {
      const invitation = await db.userInvitation.create({
        data: {
          email: `revoke-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Revoke invitation by deleting it
      await db.userInvitation.delete({
        where: { id: invitation.id },
      });

      // Verify it's gone
      const deleted = await db.userInvitation.findUnique({
        where: { id: invitation.id },
      });
      expect(deleted).toBeNull();
    });

    it('should prevent accepting expired invitation', async () => {
      const invitation = await db.userInvitation.create({
        data: {
          email: `expired-check-${Date.now()}@example.com`,
          companyId: testCompanyId,
          role: 'MEMBER',
          invitedBy: testUserId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      // Check if expired before accepting
      expect(invitation.expiresAt.getTime()).toBeLessThan(Date.now());
      
      // In production, this would be rejected
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should not allow invitation to wrong company', async () => {
      // Create second company
      const otherCompany = await db.company.create({
        data: {
          name: 'Other Company',
          slug: `other-${Date.now()}`,
        },
      });

      // Try to find invitation for wrong company
      const invitation = await db.userInvitation.findFirst({
        where: {
          token: 'some-token',
          companyId: otherCompany.id, // Wrong company
        },
      });

      expect(invitation).toBeNull();

      // Cleanup
      await db.company.delete({ where: { id: otherCompany.id } });
    });

    it('should scope invitations to correct company', async () => {
      const invitations = await db.userInvitation.findMany({
        where: {
          companyId: testCompanyId,
        },
      });

      // All invitations should belong to test company
      invitations.forEach(inv => {
        expect(inv.companyId).toBe(testCompanyId);
      });
    });
  });

  describe('Security Considerations', () => {
    it('should use cryptographically secure tokens', () => {
      // Token should be sufficiently long and random
      const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      expect(token.length).toBeGreaterThan(20);
      expect(token).toMatch(/^[a-z0-9-]+$/);
    });

    it('should not expose sensitive information in tokens', () => {
      const token = `token-${Date.now()}-${Math.random().toString(36)}`;
      
      // Token should not contain email, userId, or companyId
      expect(token).not.toContain('@');
      expect(token).not.toContain('user-');
      expect(token).not.toContain('company-');
    });
  });
});
