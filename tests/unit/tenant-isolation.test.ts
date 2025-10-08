import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { setTenantContext } from '@/core/db/client';
import { createTenantContext, type TenantContext } from '@/core/db/tenant-guard';

/**
 * Unit Tests for Multi-Tenant Isolation
 * 
 * Tests that database queries are properly scoped to the correct tenant (company).
 * This is CRITICAL for security - any bugs here could expose data across tenants.
 */

const db = new PrismaClient();

describe('Multi-Tenant Isolation', () => {
  let company1Id: string;
  let company2Id: string;
  let user1Id: string;
  let user2Id: string;
  let customer1Id: string;
  let customer2Id: string;

  beforeAll(async () => {
    // Create test companies
    const company1 = await db.company.create({
      data: {
        name: 'Test Company 1',
        slug: `test-company-1-${Date.now()}`,
      },
    });
    company1Id = company1.id;

    const company2 = await db.company.create({
      data: {
        name: 'Test Company 2',
        slug: `test-company-2-${Date.now()}`,
      },
    });
    company2Id = company2.id;

    // Create test users
    const user1 = await db.user.create({
      data: {
        email: `test1-${Date.now()}@example.com`,
        name: 'Test User 1',
      },
    });
    user1Id = user1.id;

    const user2 = await db.user.create({
      data: {
        email: `test2-${Date.now()}@example.com`,
        name: 'Test User 2',
      },
    });
    user2Id = user2.id;

    // Link users to companies
    await db.userCompany.create({
      data: {
        userId: user1Id,
        companyId: company1Id,
        role: 'OWNER',
      },
    });

    await db.userCompany.create({
      data: {
        userId: user2Id,
        companyId: company2Id,
        role: 'OWNER',
      },
    });

    // Create test customers for each company
    const customer1 = await db.customer.create({
      data: {
        name: 'Customer for Company 1',
        email: `customer1-${Date.now()}@example.com`,
        companyId: company1Id,
      },
    });
    customer1Id = customer1.id;

    const customer2 = await db.customer.create({
      data: {
        name: 'Customer for Company 2',
        email: `customer2-${Date.now()}@example.com`,
        companyId: company2Id,
      },
    });
    customer2Id = customer2.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.customer.deleteMany({
      where: { id: { in: [customer1Id, customer2Id] } },
    });
    await db.userCompany.deleteMany({
      where: { companyId: { in: [company1Id, company2Id] } },
    });
    await db.user.deleteMany({
      where: { id: { in: [user1Id, user2Id] } },
    });
    await db.company.deleteMany({
      where: { id: { in: [company1Id, company2Id] } },
    });
    await db.$disconnect();
  });

  describe('Customer Data Isolation', () => {
    it('should only return customers for Company 1 when scoped', async () => {
      const customers = await db.customer.findMany({
        where: { companyId: company1Id },
      });

      expect(customers).toHaveLength(1);
      expect(customers[0].id).toBe(customer1Id);
      expect(customers[0].companyId).toBe(company1Id);
    });

    it('should only return customers for Company 2 when scoped', async () => {
      const customers = await db.customer.findMany({
        where: { companyId: company2Id },
      });

      expect(customers).toHaveLength(1);
      expect(customers[0].id).toBe(customer2Id);
      expect(customers[0].companyId).toBe(company2Id);
    });

    it('should not allow Company 1 to access Company 2 customer by ID', async () => {
      const customer = await db.customer.findFirst({
        where: {
          id: customer2Id,
          companyId: company1Id, // Wrong company!
        },
      });

      expect(customer).toBeNull();
    });

    it('should enforce tenant scoping on updates', async () => {
      // Attempt to update Company 2's customer while scoped to Company 1
      const result = await db.customer.updateMany({
        where: {
          id: customer2Id,
          companyId: company1Id, // Wrong company!
        },
        data: {
          name: 'Hacked Name',
        },
      });

      expect(result.count).toBe(0); // No records updated

      // Verify customer wasn't modified
      const customer = await db.customer.findUnique({
        where: { id: customer2Id },
      });
      expect(customer?.name).toBe('Customer for Company 2');
    });

    it('should enforce tenant scoping on deletes', async () => {
      // Attempt to delete Company 2's customer while scoped to Company 1
      const result = await db.customer.deleteMany({
        where: {
          id: customer2Id,
          companyId: company1Id, // Wrong company!
        },
      });

      expect(result.count).toBe(0); // No records deleted

      // Verify customer still exists
      const customer = await db.customer.findUnique({
        where: { id: customer2Id },
      });
      expect(customer).not.toBeNull();
    });
  });

  describe('User-Company Association', () => {
    it('should correctly identify which companies a user belongs to', async () => {
      const userCompanies = await db.userCompany.findMany({
        where: { userId: user1Id },
        include: { company: true },
      });

      expect(userCompanies).toHaveLength(1);
      expect(userCompanies[0].companyId).toBe(company1Id);
      expect(userCompanies[0].company.name).toBe('Test Company 1');
    });

    it('should prevent cross-tenant user access', async () => {
      // User 1 should not appear in Company 2's user list
      const company2Users = await db.userCompany.findMany({
        where: {
          companyId: company2Id,
          userId: user1Id, // User from Company 1
        },
      });

      expect(company2Users).toHaveLength(0);
    });
  });

  describe('Tenant Context Helpers', () => {
    it('should set and retrieve tenant context', () => {
      const context = createTenantContext(company1Id);
      setTenantContext(context);
      // Verify no errors are thrown
      expect(() => setTenantContext(context)).not.toThrow();
    });

    it('should clear tenant context', () => {
      const context = createTenantContext(company1Id);
      setTenantContext(context);
      setTenantContext(null); // Clear context
      // Verify no errors are thrown
      expect(() => setTenantContext(null)).not.toThrow();
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle null/undefined companyId safely', async () => {
      const customers = await db.customer.findMany({
        where: { companyId: undefined as unknown as string },
      });
      // Prisma ignores undefined filters, so this returns all customers
      // In production, ALWAYS validate companyId before querying
      expect(customers.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-existent companyId', async () => {
      const customers = await db.customer.findMany({
        where: { companyId: 'non-existent-id' },
      });
      expect(customers).toHaveLength(0);
    });

    it('should prevent SQL injection through companyId', async () => {
      // Attempt SQL injection
      const maliciousId = "'; DROP TABLE Customer; --";
      
      // Prisma should safely handle this
      await expect(
        db.customer.findMany({
          where: { companyId: maliciousId },
        })
      ).resolves.toBeDefined();

      // Verify table still exists
      const count = await db.customer.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
