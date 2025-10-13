import { fastify } from '../fastify.js';
import { db } from '../../db.js';
import { userDtoSchema, createUserDtoSchema, tentantDtoSchema, userWithTenantsDtoSchema } from 'common';

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
      const user = await db.getUser(request.body.id);
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
      await db.createUser(request.body.id, request.body.tenantId);
      return reply.status(201).send();
    }
  );

  _fastify.post(
    '/user/tenants',
    {
      schema: {
        params: userDtoSchema,
        body: tentantDtoSchema,
      },
    },
    async (request, reply) => {
      await db.addUserToTenant(request.params.id, request.body.id);
      return reply.status(201).send();
    }
  );
}

export default userManagementRoutes;
