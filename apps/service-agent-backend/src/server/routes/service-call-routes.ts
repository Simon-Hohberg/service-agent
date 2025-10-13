import { createHttpServiceCallDtoSchema, getServiceCallsDtoSchema } from 'common';
import { scheduleJob } from 'node-schedule';
import { db } from '../../db.js';
import { executeServiceCall } from '../../service-call-executor/service-call-executor.js';
import { fastify } from '../fastify.js';
import { authHandler } from './auth-handler.js';

export function serviceCallRoutes(_fastify: typeof fastify) {
  _fastify.get(
    '/',
    {
      schema: {
        response: {
          200: getServiceCallsDtoSchema,
          400: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
            required: ['message'],
            additionalProperties: false,
          },
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
      preHandler: authHandler,
    },
    async (request, reply) => {
      const tenantId = request.requestContext.get('tenantId');
      const userId = request.requestContext.get('userId');
      if (tenantId === undefined || userId === undefined) {
        return reply.status(400).send({ message: 'Missing tenantId or userId in request context' });
      }
      const serviceCalls = await db.getServiceCalls(tenantId);
      const favorites = await db.getServiceCallFavorites(userId);

      return reply.send(
        serviceCalls.map((sc) => ({
          protocol: sc.protocol,
          id: sc.id,
          name: sc.name,
          status: sc.status,
          executedAt: sc.executedAt?.toISOString(),
          scheduledAt: sc.scheduledAt?.toISOString(),
          submittedAt: sc.submittedAt.toISOString(),
          isFavorite: favorites.includes(sc.id),
        }))
      );
    }
  );

  _fastify.post(
    '/http',
    {
      schema: {
        body: createHttpServiceCallDtoSchema,
      },
      preHandler: authHandler,
    },
    async (request, reply) => {
      const tenantId = request.requestContext.get('tenantId');
      if (tenantId === undefined) {
        return reply.status(400).send({ message: 'Missing tenantId in request context' });
      }

      const serviceCallData = {
        tenantId,
        protocol: 'HTTP' as const,
        ...request.body,
      };

      const createServiceCallResult = await db.createServiceCall(serviceCallData);

      if (serviceCallData.scheduledAt) {
        scheduleJob(new Date(serviceCallData.scheduledAt), () => {
          executeServiceCall(createServiceCallResult);
        });
        return reply.status(201).send();
      }

      const result = await executeServiceCall(createServiceCallResult);
      return reply.status(201).send(result);
    }
  );
}

export default serviceCallRoutes;
