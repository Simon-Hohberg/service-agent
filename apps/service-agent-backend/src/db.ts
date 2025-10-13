import { CreateHttpServiceCall, UserWithTenantsDTO } from 'common';
import { HttpServiceCallDetails, Prisma, PrismaClient, ServiceCall } from '../generated/client/client.js';

export type CreateServiceCall = CreateHttpServiceCall & { protocol: 'HTTP'; tenantId: string };

export type ServiceCallDetails = HttpServiceCallDetails;

export type CreateServiceCallResult = {
  serviceCall: ServiceCall;
  details: ServiceCallDetails;
};

export class DB {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

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

  removeUserFromTenant(userId: string, tenantId: string) {
    return this.prisma.userTenant.deleteMany({
      where: {
        userId,
        tenantId,
      },
    });
  }

  async createServiceCall(serviceCallData: CreateServiceCall): Promise<CreateServiceCallResult> {
    return await this.prisma.$transaction(async (prisma) => {
      const serviceCall = await prisma.serviceCall.create({
        data: {
          tenantId: serviceCallData.tenantId,
          name: serviceCallData.name,
          scheduledAt: serviceCallData.scheduledAt ? new Date(serviceCallData.scheduledAt) : null,
          protocol: serviceCallData.protocol,
        },
      });

      let details;
      if (serviceCallData.protocol === 'HTTP') {
        details = await prisma.httpServiceCallDetails.create({
          data: {
            serviceCallId: serviceCall.id,
            url: serviceCallData.request.url,
            method: serviceCallData.request.method,
            requestBody: serviceCallData.request.body,
            requestHeaders: serviceCallData.request.headers || undefined,
          },
        });
      } else {
        throw new Error('Unsupported protocol');
      }

      return {
        serviceCall,
        details,
      };
    });
  }

  updateServiceCall(serviceCallId: number, serviceCallData: Prisma.ServiceCallUpdateInput) {
    return this.prisma.serviceCall.update({
      where: {
        id: serviceCallId,
      },
      data: serviceCallData,
    });
  }

  getServiceCalls(tenantId: string): Promise<ServiceCall[]> {
    return this.prisma.serviceCall.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
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
}

export const db = new DB();
