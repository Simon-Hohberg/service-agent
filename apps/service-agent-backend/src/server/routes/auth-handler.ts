import { RouteHandler } from 'fastify';
import { db } from '../../db.js';

/* This is where authentication would happen. However, here we just extract userId and tenantId from headers and set them in request context */
export const authHandler: RouteHandler = async (req, reply) => {
  const userId = req.headers['x-user-id'];
  const tenantId = req.headers['x-tenant-id'];
  if (!userId || !tenantId || Array.isArray(userId) || Array.isArray(tenantId)) {
    reply.status(400).send({ message: 'Missing or malformed x-user-id or x-tenant-id header' });
    return;
  }
  if (!(await db.isUserInTenant(userId, tenantId))) {
    reply.status(403).send({ message: 'User does not belong to the specified tenant' });
    return;
  }
  req.requestContext.set('userId', userId);
  req.requestContext.set('tenantId', tenantId);
};
