import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import Fastify from 'fastify';
import { authRoutes } from './routes/auth-routes.js';
import fastifyRequestContext from '@fastify/request-context';
import tenantRoutes from './routes/tenant-routes.js';

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
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(tenantRoutes, { prefix: '/tenant' });
