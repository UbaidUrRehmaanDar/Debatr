import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import { config } from '../config/env.js';
import { registerAuthRoutes } from './auth.js';
import { registerDebateRoutes } from './debates.js';
import { registerInvitationRoutes } from './invitations.js';
import { registerAdminRoutes } from './admin.js';
import { registerExportRoutes } from './exports_routes.js';

export async function registerRoutes(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: config.webOrigin,
    credentials: true,
  });

  await fastify.register(cookie, {
    secret: config.betterAuthSecret,
  });

  await fastify.register(websocket);

  // Health check
  fastify.get('/api/health', async () => ({ status: 'ok', env: config.nodeEnv }));

  await registerAuthRoutes(fastify);
  await registerDebateRoutes(fastify);
  await registerInvitationRoutes(fastify);
  await registerAdminRoutes(fastify);
  await registerExportRoutes(fastify);

  return fastify;
}
