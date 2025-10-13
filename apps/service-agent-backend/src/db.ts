import { UserDTO, UserWithTenantsDTO } from 'common';
import { PrismaClient } from '../generated/client/client.js';

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
}

export const db = new DB();
