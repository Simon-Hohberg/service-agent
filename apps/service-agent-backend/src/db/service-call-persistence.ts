import { CreateHttpServiceCall } from 'common';
import { HttpServiceCallDetails, Prisma, PrismaClient, ServiceCall } from '../../generated/client/client.js';
import { prismaClient } from './prisma-client.js';

export type CreateServiceCall = CreateHttpServiceCall & { protocol: 'HTTP'; tenantId: string };

export type ServiceCallDetails = HttpServiceCallDetails;

export type CreateServiceCallResult = {
  serviceCall: ServiceCall;
  details: ServiceCallDetails;
};

export class ServiceCallPersistence {
  constructor(private prisma: PrismaClient = prismaClient) {}

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
}

export const db = new ServiceCallPersistence();
