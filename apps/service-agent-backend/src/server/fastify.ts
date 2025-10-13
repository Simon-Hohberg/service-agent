import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import Fastify from 'fastify';
import { userManagementRoutes } from './routes/user-management-routes.js';

export const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(userManagementRoutes);
