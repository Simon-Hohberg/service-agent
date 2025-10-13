import { RouteHandler } from 'fastify';

/* This is where authentication would happen. However, here we just extract userId and tenantId from headers and set them in request context */
export const authHandler: RouteHandler = async (req, reply) => {
  const userId = req.headers['x-user-id'];
  if (!userId || Array.isArray(userId)) {
    reply.status(400).send({ message: 'Missing or malformed x-user-id or x-tenant-id header' });
    return;
  }
  req.requestContext.set('userId', userId);
};
