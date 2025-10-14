import { CreateHttpServiceCallDTO, UserWithTenantsDTO } from 'common';
import { HttpServiceCallDetails, PrismaClient, ServiceCall } from '../../generated/client/client.js';
import { prismaClient } from './prisma-client.js';

export type CreateServiceCall = CreateHttpServiceCallDTO & { protocol: 'HTTP'; tenantId: string };

export type ServiceCallDetails = HttpServiceCallDetails;

export type CreateServiceCallResult = {
  serviceCall: ServiceCall;
  details: ServiceCallDetails;
};

export class UserPersistence {
  constructor(private prisma: PrismaClient = prismaClient) {}

  createUser(id: string, tenantId: string) {
    return this.prisma.user.create({
      data: {
        id,
        tenants: {
          create: {
            tenantId,
          },
        },
      },
    });
  }

  deleteUser(id: string) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async getUser(id: string): Promise<UserWithTenantsDTO | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        tenants: {
          select: {
            tenant: {
              select: { id: true },
            },
          },
        },
      },
    });
    if (!user) {
      return null;
    }
    return {
      id,
      tenants: user.tenants.map((ut) => ({ id: ut.tenant.id })),
    };
  }

  async getServiceCallFavorites(userId: string): Promise<number[]> {
    const favorites = await this.prisma.serviceCallFavorite.findMany({
      where: {
        userId,
      },
      select: {
        serviceCallId: true,
      },
    });
    return favorites.map((f) => f.serviceCallId);
  }

  async isServiceCallFavorite(userId: string, serviceCallId: number): Promise<boolean> {
    const favorite = await this.prisma.serviceCallFavorite.findUnique({
      where: {
        userId_serviceCallId: {
          userId,
          serviceCallId,
        },
      },
    });
    return favorite !== null;
  }

  async addServiceCallFavorite(userId: string, serviceCallId: number): Promise<void> {
    await this.prisma.serviceCallFavorite.upsert({
      where: {
        userId_serviceCallId: {
          userId,
          serviceCallId,
        },
      },
      create: {
        userId,
        serviceCallId,
      },
      update: {},
    });
  }

  async removeServiceCallFavorite(userId: string, serviceCallId: number): Promise<void> {
    await this.prisma.serviceCallFavorite.deleteMany({
      where: {
        userId,
        serviceCallId,
      },
    });
  }
}

export const userPersistence = new UserPersistence();
