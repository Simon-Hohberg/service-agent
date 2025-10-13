import { createHttpServiceCallDtoSchema, userWithTenantsDtoSchema } from 'common';
import { scheduleJob } from 'node-schedule';
import { db } from '../../db.js';
import { executeServiceCall } from '../../service-call-executor/service-call-executor.js';
import { fastify } from '../fastify.js';
import { authHandler } from './auth-handler.js';

export function serviceCallRoutes(_fastify: typeof fastify) {
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
