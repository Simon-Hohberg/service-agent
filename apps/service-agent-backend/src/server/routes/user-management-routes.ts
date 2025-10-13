import { createUserDtoSchema, tentantDtoSchema, userDtoSchema, userWithTenantsDtoSchema } from 'common';
import { tenantPersistence } from '../../db/tenant-persistence.js';
import { userPersistence } from '../../db/user-persistence.js';
import { fastify } from '../fastify.js';

export function userManagementRoutes(_fastify: typeof fastify) {
  _fastify.post(
    '/signin',
    {
      schema: {
        body: userDtoSchema,
        response: {
          200: userWithTenantsDtoSchema,
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
            required: ['message'],
            additionalProperties: false,
          },
        },
      },
    },
    async (request, reply) => {
      const user = await userPersistence.getUser(request.body.id);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      return reply.send(user);
    }
  );

  _fastify.post(
    '/',
    {
      schema: {
        body: createUserDtoSchema,
      },
    },
    async (request, reply) => {
      await userPersistence.createUser(request.body.id, request.body.tenantId);
      return reply.status(201).send();
    }
  );

  _fastify.post(
    '/tenants',
    {
      schema: {
        params: userDtoSchema,
        body: tentantDtoSchema,
      },
    },
    async (request, reply) => {
      await tenantPersistence.addUserToTenant(request.params.id, request.body.id);
      return reply.status(201).send();
    }
  );
}

export default userManagementRoutes;
