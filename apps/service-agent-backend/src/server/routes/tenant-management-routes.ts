import { tentantDtoSchema } from 'common';
import { tenantPersistence } from '../../db/tenant-persistence.js';
import { fastify } from '../fastify.js';

export function tenantManagementRoutes(_fastify: typeof fastify) {
  _fastify.post(
    '/',
    {
      schema: {
        body: tentantDtoSchema,
      },
    },
    async (request, reply) => {
      await tenantPersistence.createTenant(request.body.id);
      return reply.status(201).send();
    }
  );
}

export default tenantManagementRoutes;
