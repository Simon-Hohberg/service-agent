import {
  createHttpServiceCallDtoSchema,
  createUserDtoSchema,
  getServiceCallsDtoSchema,
  tentantDtoSchema,
  userDtoSchema,
} from 'common';
import { tenantPersistence } from '../../db/tenant-persistence.js';
import { fastify } from '../fastify.js';
import { userPersistence } from '../../db/user-persistence.js';
import { authHandler } from './auth-handler.js';
import { scheduleJob } from 'node-schedule';
import { executeServiceCall } from '../../service-call-executor/service-call-executor.js';
import { serviceCallPersistence } from '../../db/service-call-persistence.js';

export const tenantParamSchema = {
  type: 'object',
  properties: {
    tenantId: { type: 'string' },
  },
  required: ['tenantId'],
  additionalProperties: false,
} as const;

export function tenantRoutes(_fastify: typeof fastify) {
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

  _fastify.delete(
    '/:tenantId',
    {
      schema: {
        params: tenantParamSchema,
      },
    },
    async (request, reply) => {
      await tenantPersistence.deleteTenant(request.params.tenantId);
      return reply.status(204).send();
    }
  );

  _fastify.post(
    '/:tenantId/user',
    {
      schema: {
        params: tenantParamSchema,
        body: createUserDtoSchema,
      },
    },
    async (request, reply) => {
      await userPersistence.createUser(request.body.id, request.params.tenantId);
      return reply.status(201).send();
    }
  );

  _fastify.put(
    '/:tenantId/user',
    {
      schema: {
        params: tenantParamSchema,
        body: userDtoSchema,
      },
    },
    async (request, reply) => {
      await tenantPersistence.addUserToTenant(request.body.id, request.params.tenantId);
      return reply.status(201).send();
    }
  );

  _fastify.get(
    '/:tenantId/serviceCalls',
    {
      schema: {
        params: tenantParamSchema,
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
      const tenantId = request.params.tenantId;
      const userId = request.requestContext.get('userId');
      if (userId === undefined) {
        return reply.status(400).send({ message: 'Missing userId in request context' });
      }
      if (!tenantPersistence.isUserInTenant(userId, tenantId)) {
        return reply.status(404).send({ message: 'User is not in tenant' });
      }
      const serviceCalls = await serviceCallPersistence.getServiceCalls(tenantId);
      const favorites = await userPersistence.getServiceCallFavorites(userId);

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
    '/:tenantId/serviceCall/http',
    {
      schema: {
        params: tenantParamSchema,
        body: createHttpServiceCallDtoSchema,
        // TODO: response type
      },
      preHandler: authHandler,
    },
    async (request, reply) => {
      const tenantId = request.params.tenantId;
      const userId = request.requestContext.get('userId');
      if (userId === undefined) {
        return reply.status(400).send({ message: 'Missing userId in request context' });
      }
      if (!tenantPersistence.isUserInTenant(userId, tenantId)) {
        return reply.status(404).send({ message: 'User is not in tenant' });
      }

      const serviceCallData = {
        tenantId,
        protocol: 'HTTP' as const,
        ...request.body,
      };

      const createServiceCallResult = await serviceCallPersistence.createServiceCall(serviceCallData);

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

export default tenantRoutes;
