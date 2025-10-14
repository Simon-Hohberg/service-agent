import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { prismaTestingClient, prismaTestingHelper } from './prisma-testing-client.js';
import { UserPersistence } from './user-persistence.js';

describe('UserPersistence', () => {
  const userPersistence = new UserPersistence(prismaTestingClient);

  beforeEach(async () => {
    await prismaTestingHelper.startNewTransaction();
  });

  afterEach(() => {
    prismaTestingHelper.rollbackCurrentTransaction();
  });

  test('should create a user in a tenant', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });

    const user = await userPersistence.createUser(userId, tenantId);

    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    const retrievedUser = await prismaTestingClient.user.findUnique({
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
    await expect(userPersistence.createUser(userId, tenantId)).rejects.toThrow();
  });

  test('should fail to create a user with duplicate id', async () => {
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
    await expect(userPersistence.createUser(userId, tenantId)).rejects.toThrow();
  });

  test('should get a user with tenants', async () => {
    const tenant1Id = 'tenant1';
    const tenant2Id = 'tenant2';
    const userId = 'user1';
    await prismaTestingClient.tenant.createMany({ data: [{ id: tenant1Id }, { id: tenant2Id }] });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: [{ tenantId: tenant1Id }, { tenantId: tenant2Id }] } },
    });

    const user = await userPersistence.getUser(userId);
    expect(user).toBeDefined();
    expect(user!.id).toBe(userId);
    expect(user!.tenants).toHaveLength(2);
    expect(user!.tenants.map((t) => t.id).sort()).toEqual([tenant1Id, tenant2Id].sort());
  });

  test('should return null for a non-existent user', async () => {
    const user = await userPersistence.getUser('notExistingUser');
    expect(user).toBeNull();
  });

  test('should delete a user', async () => {
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

    const deletedUser = await userPersistence.deleteUser(userId);

    expect(deletedUser).toBeDefined();
    expect(deletedUser.id).toBe(userId);
    const retrievedUser = await prismaTestingClient.user.findUnique({
      where: { id: userId },
    });
    expect(retrievedUser).toBeNull();
  });

  test('should fail to delete a non-existent user', async () => {
    await expect(userPersistence.deleteUser('notExistingUser')).rejects.toThrow();
  });

  test('should get service call favorites for a user', async () => {
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
    await prismaTestingClient.serviceCall.createMany({
      data: [
        {
          id: 1,
          tenantId: tenantId,
          name: 'Service Call 1',
          protocol: 'HTTP',
          status: 'PENDING',
          submittedAt: new Date(),
        },
        {
          id: 2,
          tenantId: tenantId,
          name: 'Service Call 2',
          protocol: 'HTTP',
          status: 'PENDING',
          submittedAt: new Date(),
        },
        {
          id: 3,
          tenantId: tenantId,
          name: 'Service Call 3',
          protocol: 'HTTP',
          status: 'PENDING',
          submittedAt: new Date(),
        },
      ],
    });
    await prismaTestingClient.serviceCallFavorite.createMany({
      data: [
        { userId: userId, serviceCallId: 1 },
        { userId: userId, serviceCallId: 3 },
      ],
    });

    const favorites = await userPersistence.getServiceCallFavorites(userId);

    expect(favorites).toBeDefined();
    expect(favorites).toHaveLength(2);
    expect(favorites.sort()).toEqual([1, 3].sort());
  });

  test('should add a service call favorite for a user', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    const serviceCallId = 1;
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await prismaTestingClient.serviceCall.create({
      data: {
        id: serviceCallId,
        tenantId: tenantId,
        name: 'Service Call 1',
        protocol: 'HTTP',
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    await userPersistence.addServiceCallFavorite(userId, serviceCallId);

    const favorites = await prismaTestingClient.serviceCallFavorite.findMany({
      where: { userId: userId },
    });
    expect(favorites).toBeDefined();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].serviceCallId).toBe(serviceCallId);
  });

  test('should do nothing when adding a duplicate service call favorite for a user', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    const serviceCallId = 1;
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await prismaTestingClient.serviceCall.create({
      data: {
        id: serviceCallId,
        tenantId: tenantId,
        name: 'Service Call 1',
        protocol: 'HTTP',
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });
    await prismaTestingClient.serviceCallFavorite.create({
      data: { userId: userId, serviceCallId: serviceCallId },
    });
    await userPersistence.addServiceCallFavorite(userId, serviceCallId);
    await userPersistence.addServiceCallFavorite(userId, serviceCallId);
    const favorites = await prismaTestingClient.serviceCallFavorite.findMany({
      where: { userId: userId },
    });
    expect(favorites).toBeDefined();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].serviceCallId).toBe(serviceCallId);
  });

  test('should remove a service call favorite for a user', async () => {
    const tenantId = 'tenant1';
    const userId = 'user1';
    const serviceCallId = 1;
    await prismaTestingClient.tenant.create({
      data: {
        id: tenantId,
      },
    });
    await prismaTestingClient.user.create({
      data: { id: userId, tenants: { create: { tenantId: tenantId } } },
    });
    await prismaTestingClient.serviceCall.create({
      data: {
        id: serviceCallId,
        tenantId: tenantId,
        name: 'Service Call 1',
        protocol: 'HTTP',
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });
    await prismaTestingClient.serviceCallFavorite.create({
      data: { userId: userId, serviceCallId: serviceCallId },
    });

    await userPersistence.removeServiceCallFavorite(userId, serviceCallId);

    const favorites = await prismaTestingClient.serviceCallFavorite.findMany({
      where: { userId: userId },
    });
    expect(favorites).toBeDefined();
    expect(favorites).toHaveLength(0);
  });
});
