import { userDtoSchema, userWithTenantsDtoSchema } from 'common';
import { db } from '../../db.js';
import { fastify } from '../fastify.js';
import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';

/* This is where authentication would happen. However, here we just extract userId and tenantId from headers and set them in request context */
export const authHandler: RouteHandler = (req, reply) => {
  if (!req.headers['x-user-id'] || !req.headers['x-tenant-id']) {
    reply.status(400).send({ message: 'Missing x-user-id or x-tenant-id header' });
    return;
  }
  req.requestContext.set('userId', req.headers['x-user-id'] as string);
  req.requestContext.set('tenantId', req.headers['x-tenant-id'] as string);
};
