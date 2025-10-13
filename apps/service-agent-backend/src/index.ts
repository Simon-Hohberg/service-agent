import { fastify } from './server/fastify.js';

async function main() {
  await fastify.listen({ port: 3000 });
  console.log('Service Agent Backend is running...');
}

main();
