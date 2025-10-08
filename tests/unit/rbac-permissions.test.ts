import { describe, it, expect } from 'vitest';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, checkPermission, hasAnyPermission, hasAllPermissions } from '@/shared/lib/permissions';

/**
 * Unit Tests for RBAC Permission Checking
 * 
 * Tests the core permission validation logic that protects all API routes and UI components.
 * This is CRITICAL for security - any bugs here could allow unauthorized access.
 */

describe('RBAC Permission System', () => {
  describe('Permission Constants', () => {
    it('should have all 29 expected permissions defined', () => {
      const allPermissions = Object.values(PERMISSIONS);
      expect(allPermissions).toHaveLength(29);
    });

    it('should have unique permission strings', () => {
      const allPermissions = Object.values(PERMISSIONS);
      const uniquePermissions = new Set(allPermissions);
      expect(uniquePermissions.size).toBe(allPermissions.length);
    });

    it('should follow naming convention (resource:action)', () => {
      const allPermissions = Object.values(PERMISSIONS);
      allPermissions.forEach(permission => {
        // Allow multi-level namespaces and underscores: api_key:create, team:role:update
        expect(permission).toMatch(/^[a-z_]+(:[a-z_]+)+$/);
      });
    });
  });

  describe('checkPermission', () => {
    it('should return true when user has the required permission', () => {
      const userPermissions = ['customer:view', 'customer:create'];
      expect(checkPermission(userPermissions, 'customer:view')).toBe(true);
    });

    it('should return false when user lacks the required permission', () => {
      const userPermissions = ['customer:view'];
      expect(checkPermission(userPermissions, 'customer:delete')).toBe(false);
    });

    it('should return false for empty permission list', () => {
      expect(checkPermission([], 'customer:view')).toBe(false);
    });

    it('should handle wildcard permissions', () => {
      const userPermissions = ['*'];
      expect(checkPermission(userPermissions, 'customer:delete')).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has ANY of the required permissions', () => {
      const userPermissions = ['customer:view', 'customer:create'];
      expect(hasAnyPermission(userPermissions, ['customer:view', 'customer:delete'])).toBe(true);
    });

    it('should return false if user has NONE of the required permissions', () => {
      const userPermissions = ['customer:view'];
      expect(hasAnyPermission(userPermissions, ['customer:delete', 'customer:update'])).toBe(false);
    });

    it('should return true for empty required permissions array', () => {
      const userPermissions = ['customer:view'];
      expect(hasAnyPermission(userPermissions, [])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true only if user has ALL required permissions', () => {
      const userPermissions = ['customer:view', 'customer:create', 'customer:update'];
      expect(hasAllPermissions(userPermissions, ['customer:view', 'customer:create'])).toBe(true);
    });

    it('should return false if user is missing ANY required permission', () => {
      const userPermissions = ['customer:view', 'customer:create'];
      expect(hasAllPermissions(userPermissions, ['customer:view', 'customer:delete'])).toBe(false);
    });

    it('should return true for empty required permissions array', () => {
      const userPermissions = ['customer:view'];
      expect(hasAllPermissions(userPermissions, [])).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    it('should be case-sensitive for permissions', () => {
      const userPermissions = ['customer:view'];
      expect(checkPermission(userPermissions, 'CUSTOMER:VIEW')).toBe(false);
    });

    it('should not allow partial matches', () => {
      const userPermissions = ['customer:view'];
      expect(checkPermission(userPermissions, 'customer:vie')).toBe(false);
      expect(checkPermission(userPermissions, 'customer')).toBe(false);
    });

    it('should handle malformed permission strings safely', () => {
      const userPermissions = ['customer:view'];
      expect(checkPermission(userPermissions, '')).toBe(false);
      expect(checkPermission(userPermissions, 'invalid')).toBe(false);
    });
  });

  describe('Role-Based Permission Sets', () => {
    it('should validate Owner has all 29 permissions', () => {
      const ownerPermissions = DEFAULT_ROLE_PERMISSIONS['OWNER'];
      
      expect(ownerPermissions).toHaveLength(29);
      
      // Check a few critical ones
      expect(ownerPermissions).toContain('team:remove');
      expect(ownerPermissions).toContain('org:delete');
      expect(ownerPermissions).toContain('billing:update');
      expect(ownerPermissions).toContain('role:create');
    });

    it('should validate Admin has appropriate subset', () => {
      const adminPermissions = DEFAULT_ROLE_PERMISSIONS['ADMIN'];
      const ownerPermissions = DEFAULT_ROLE_PERMISSIONS['OWNER'];
      
      // Admin should have fewer permissions than Owner
      expect(adminPermissions.length).toBeLessThan(ownerPermissions.length);
      
      // Admin should NOT have destructive org permissions
      expect(adminPermissions).not.toContain('org:delete');
      
      // But should have most management permissions
      expect(adminPermissions).toContain('team:invite');
      expect(adminPermissions).toContain('customer:delete');
    });
  });
});
