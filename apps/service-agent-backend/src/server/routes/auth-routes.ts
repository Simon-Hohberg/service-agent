import { userDtoSchema, userWithTenantsDtoSchema } from 'common';
import { userPersistence } from '../../db/user-persistence.js';
import { fastify } from '../fastify.js';

export function authRoutes(_fastify: typeof fastify) {
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
}

export default authRoutes;
