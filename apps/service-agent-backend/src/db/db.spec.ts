process.env.DATABASE_URL = 'file:./jest-test.db';
import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';

import { PrismaTestingHelper } from '@chax-at/transactional-prisma-testing';
import { PrismaClient } from '../../generated/client/index.js';
import { DB } from './db.js';

describe('db', () => {
  const originalPrismaService = new PrismaClient();
  const prismaTestingHelper = new PrismaTestingHelper(originalPrismaService);
  const prismaService = prismaTestingHelper.getProxyClient();
  const db = new DB(prismaService);

  beforeEach(async () => {
    await prismaTestingHelper.startNewTransaction();
  });

  afterEach(() => {
    prismaTestingHelper.rollbackCurrentTransaction();
  });

  describe('tenant operations', () => {
    test('should create a tenant', async () => {
      const tenantId = 'tenant1';
      const tenant = await db.createTenant(tenantId);
      const tenants = await prismaService.tenant.findMany();
      expect(tenant).toBeDefined();
      expect(tenant.id).toBe(tenantId);
      expect(tenants).toHaveLength(1);
      expect(tenants[0].id).toBe(tenantId);
    });

    test('should fail to create a tenant with duplicate id', async () => {
      const tenantId = 'tenant1';
      await db.createTenant(tenantId);
      await expect(db.createTenant(tenantId)).rejects.toThrow();
    });

    test('should delete a tenant', async () => {
      const tenantId = 'tenant1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      const deletedTenant = await db.deleteTenant(tenantId);
      expect(deletedTenant).toBeDefined();
      expect(deletedTenant.id).toBe(tenantId);
      const tenants = await prismaService.tenant.findMany();
      expect(tenants).toHaveLength(0);
    });

    test('should fail to delete a non-existent tenant', async () => {
      const tenantId = 'tenant1';
      await expect(db.deleteTenant(tenantId)).rejects.toThrow();
    });

    test('should add a user to a tenant', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const userId = 'user1';
      await prismaService.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenant1Id } } },
      });

      await db.addUserToTenant(userId, tenant2Id);

      const user = await prismaService.user.findUnique({
        where: { id: userId },
        select: { tenants: { select: { tenantId: true } } },
      });
      expect(user).toBeDefined();
      expect(user!.tenants).toHaveLength(2);
      expect(user!.tenants.map((t) => t.tenantId).sort()).toEqual([tenant1Id, tenant2Id].sort());
    });

    test('should fail to add a user to a non-existent tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenantId } } },
      });
      await expect(db.addUserToTenant(userId, 'notExistingTenant')).rejects.toThrow();
    });

    test('should fail to add a non-existent user to a tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await expect(db.addUserToTenant(userId, tenantId)).rejects.toThrow();
    });

    test('should fail to add a user to a tenant they are already in', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenantId } } },
      });
      await expect(db.addUserToTenant(userId, tenantId)).rejects.toThrow();
    });

    test('should remove a user from a tenant', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const userId = 'user1';
      await prismaService.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: [{ tenantId: tenant1Id }, { tenantId: tenant2Id }] } },
      });

      await db.removeUserFromTenant(userId, tenant2Id);

      const user = await prismaService.user.findUnique({
        where: { id: userId },
        select: { tenants: { select: { tenantId: true } } },
      });
      expect(user).toBeDefined();
      expect(user!.tenants).toHaveLength(1);
      expect(user!.tenants[0].tenantId).toBe(tenant1Id);
    });

    test('should fail to remove a user from a tenant they are not in', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const userId = 'user1';
      await prismaService.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: [{ tenantId: tenant1Id }] } },
      });
      await expect(db.removeUserFromTenant(userId, tenant2Id)).rejects.toThrow();
    });

    test('should fail to remove a non-existent user from a tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await expect(db.removeUserFromTenant(userId, tenantId)).rejects.toThrow();
    });

    test('should fail to remove a user from a non-existent tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenantId } } },
      });
      await expect(db.removeUserFromTenant(userId, 'notExistingTenant')).rejects.toThrow();
    });

    test('should fail to remove a user from a tenant if the user is in only that tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenantId } } },
      });
      await expect(db.removeUserFromTenant(userId, tenantId)).rejects.toThrow();
    });

    test('should check if user is in tenant', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenant1Id,
        },
      });
      await prismaService.tenant.create({
        data: {
          id: tenant2Id,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenant1Id } } },
      });
      const isInTenant1 = await db.isUserInTenant(userId, tenant1Id);
      const isInTenant2 = await db.isUserInTenant(userId, tenant2Id);
      expect(isInTenant1).toBe(true);
      expect(isInTenant2).toBe(false);
    });
  });

  describe('user operations', () => {
    test('should create a user in a tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });

      const user = await db.createUser(userId, tenantId);

      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      const retrievedUser = await prismaService.user.findUnique({
        where: { id: userId },
        select: { id: true, tenants: { select: { tenantId: true } } },
      });
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser!.id).toBe(userId);
      expect(retrievedUser!.tenants).toHaveLength(1);
      expect(retrievedUser!.tenants[0].tenantId).toBe(tenantId);
    });

    test('should fail to create a user in a non-existent tenant', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await expect(db.createUser(userId, tenantId)).rejects.toThrow();
    });

    test('should fail to create a user with duplicate id', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenantId } } },
      });
      await expect(db.createUser(userId, tenantId)).rejects.toThrow();
    });

    test('should get a user with tenants', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const userId = 'user1';
      await prismaService.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: [{ tenantId: tenant1Id }, { tenantId: tenant2Id }] } },
      });

      const user = await db.getUser(userId);
      expect(user).toBeDefined();
      expect(user!.id).toBe(userId);
      expect(user!.tenants).toHaveLength(2);
      expect(user!.tenants.map((t) => t.id).sort()).toEqual([tenant1Id, tenant2Id].sort());
    });

    test('should return null for a non-existent user', async () => {
      const user = await db.getUser('notExistingUser');
      expect(user).toBeNull();
    });

    test('should delete a user', async () => {
      const tenantId = 'tenant1';
      const userId = 'user1';
      await prismaService.tenant.create({
        data: {
          id: tenantId,
        },
      });
      await prismaService.user.create({
        data: { id: userId, tenants: { create: { tenantId: tenantId } } },
      });

      const deletedUser = await db.deleteUser(userId);

      expect(deletedUser).toBeDefined();
      expect(deletedUser.id).toBe(userId);
      const retrievedUser = await prismaService.user.findUnique({
        where: { id: userId },
      });
      expect(retrievedUser).toBeNull();
    });

    test('should fail to delete a non-existent user', async () => {
      await expect(db.deleteUser('notExistingUser')).rejects.toThrow();
    });
  });
});
