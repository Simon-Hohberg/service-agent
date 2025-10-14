import { CreateHttpServiceCallDTO } from 'common';
import { HttpServiceCallDetails, PrismaClient, ServiceCall } from '../../generated/client/client.js';
import { prismaClient } from './prisma-client.js';

export type CreateServiceCall = CreateHttpServiceCallDTO & { protocol: 'HTTP'; tenantId: string };

export type ServiceCallDetails = HttpServiceCallDetails;

export type CreateServiceCallResult = {
  serviceCall: ServiceCall;
  details: ServiceCallDetails;
};

export class TenantPersistence {
  constructor(private prisma: PrismaClient = prismaClient) {}

  async isUserInTenant(userId: string, tenantId: string) {
    const result = await this.prisma.userTenant.findFirst({
      where: {
        userId,
        tenantId,
      },
    });
    return result !== null;
  }

  createTenant(id: string) {
    return this.prisma.tenant.create({
      data: {
        id,
      },
    });
  }

  getTenants() {
    return this.prisma.tenant.findMany();
  }

  deleteTenant(id: string) {
    return this.prisma.tenant.delete({
      where: {
        id,
      },
    });
  }

  addUserToTenant(userId: string, tenantId: string) {
    return this.prisma.userTenant.create({
      data: {
        userId,
        tenantId,
      },
    });
  }

  async removeUserFromTenant(userId: string, tenantId: string) {
    const userTenants = await this.prisma.userTenant.findMany({
      where: {
        userId,
      },
      select: {
        tenantId: true,
      },
    });
    if (!userTenants.some((t) => t.tenantId === tenantId)) {
      throw new Error('User is not part of the specified tenant');
    }
    if (userTenants.length === 1) {
      throw new Error('User must belong to at least one tenant');
    }
    return this.prisma.userTenant.deleteMany({
      where: {
        userId,
        tenantId,
      },
    });
  }
}

export const tenantPersistence = new TenantPersistence();
