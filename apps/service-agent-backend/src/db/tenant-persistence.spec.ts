import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { prismaTestingClient, prismaTestingHelper } from './prisma-testing-client.js';
import { TenantPersistence } from './tenant-persistence.js';

describe('TenantPersistence', () => {
  const tenantPersistence = new TenantPersistence(prismaTestingClient);

  beforeEach(async () => {
    await prismaTestingHelper.startNewTransaction();
  });

  afterEach(() => {
    prismaTestingHelper.rollbackCurrentTransaction();
  });

  test('should create a tenant', async () => {
    const tenantId = 'tenant1';
    const tenant = await tenantPersistence.createTenant(tenantId);
    const tenants = await prismaTestingClient.tenant.findMany();
    expect(tenant).toBeDefined();
    expect(tenant.id).toBe(tenantId);
    expect(tenants).toHaveLength(1);
    expect(tenants[0].id).toBe(tenantId);
  });

  test('should fail to create a tenant with duplicate id', async () => {
    const tenantId = 'tenant1';
    await tenantPersistence.createTenant(tenantId);
    await expect(tenantPersistence.createTenant(tenantId)).rejects.toThrow();
  });

  test('should delete a tenant', async () => {
    const tenantId = 'tenant1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    const deletedTenant = await tenantPersistence.deleteTenant(tenantId);
    expect(deletedTenant).toBeDefined();
    expect(deletedTenant.id).toBe(tenantId);
    const tenants = await prismaTestingClient.tenant.findMany();
    expect(tenants).toHaveLength(0);
  });

  test('should fail to delete a non-existent tenant', async () => {
    const tenantId = 'tenant1';
    await expect(tenantPersistence.deleteTenant(tenantId)).rejects.toThrow();
  });

  test('should add a user to a tenant', async () => {
    const tenant1Id = 'tenant1';
    const tenant2Id = 'tenant2';
    const userId = 'user1';
    await prismaTestingClient.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenant1Id } } },
    });

    await tenantPersistence.addUserToTenant(userId, tenant2Id);

    const user = await prismaTestingClient.user.findUnique({
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
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await expect(tenantPersistence.addUserToTenant(userId, 'notExistingTenant')).rejects.toThrow();
  });

  test('should fail to add a non-existent user to a tenant', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await expect(tenantPersistence.addUserToTenant(userId, tenantId)).rejects.toThrow();
  });

  test('should fail to add a user to a tenant they are already in', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await expect(tenantPersistence.addUserToTenant(userId, tenantId)).rejects.toThrow();
  });

  test('should remove a user from a tenant', async () => {
    const tenant1Id = 'tenant1';
    const tenant2Id = 'tenant2';
    const userId = 'user1';
    await prismaTestingClient.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: [{ tenantId: tenant1Id }, { tenantId: tenant2Id }] } },
    });

    await tenantPersistence.removeUserFromTenant(userId, tenant2Id);

    const user = await prismaTestingClient.user.findUnique({
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
    await prismaTestingClient.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: [{ tenantId: tenant1Id }] } },
    });
    await expect(tenantPersistence.removeUserFromTenant(userId, tenant2Id)).rejects.toThrow();
  });

  test('should fail to remove a non-existent user from a tenant', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await expect(tenantPersistence.removeUserFromTenant(userId, tenantId)).rejects.toThrow();
  });

  test('should fail to remove a user from a non-existent tenant', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await expect(tenantPersistence.removeUserFromTenant(userId, 'notExistingTenant')).rejects.toThrow();
  });

  test('should fail to remove a user from a tenant if the user is in only that tenant', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await expect(tenantPersistence.removeUserFromTenant(userId, tenantId)).rejects.toThrow();
  });

  test('should check if user is in tenant', async () => {
    const tenant1Id = 'tenant1';
    const tenant2Id = 'tenant2';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenant1Id,
      },
    });
    await prismaTestingClient.tenant.create({
      data: {
        id: tenant2Id,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenant1Id } } },
    });
    const isInTenant1 = await tenantPersistence.isUserInTenant(userId, tenant1Id);
    const isInTenant2 = await tenantPersistence.isUserInTenant(userId, tenant2Id);
    expect(isInTenant1).toBe(true);
    expect(isInTenant2).toBe(false);
  });
});
