import { PrismaTestingHelper } from '@chax-at/transactional-prisma-testing';
import { prismaClient } from './prisma-client.js';

export const prismaTestingHelper = new PrismaTestingHelper(prismaClient);
export const prismaTestingClient = prismaTestingHelper.getProxyClient();
