import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import Fastify from 'fastify';
import { userManagementRoutes } from './routes/user-management-routes.js';
import fastifyRequestContext from '@fastify/request-context';
import tenantManagementRoutes from './routes/tenant-management-routes.js';

declare module '@fastify/request-context' {
  interface RequestContextData {
    userId: string;
    tenantId: string;
  }
}

export const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(fastifyRequestContext);
fastify.register(userManagementRoutes, { prefix: '/user' });
fastify.register(tenantManagementRoutes, { prefix: '/tenant' });
