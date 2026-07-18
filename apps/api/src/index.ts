import { config } from './config/env.js';
import { connect, disconnect } from './db/index.js';
import { init as initAuth } from './auth/index.js';
import { registerRoutes } from './routes/index.js';
import { initWebSocket } from './websocket/index.js';
import { logger } from './observability/logger.js';
import { setServers } from 'node:dns';

// Override DNS servers for environments where the system DNS cannot resolve
// Neon hostnames (e.g. corporate VPNs, routers with restricted DNS). Google's
// public DNS is a reliable fallback for cloud PostgreSQL connections.
setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
  logger.info('Starting Debatr API...');

  // Validate configuration
  if (!config.load() || !config.validate()) {
    logger.error('Configuration validation failed. Check environment variables.');
    process.exit(1);
  }

  logger.info('Configuration validated successfully');

  // Initialize database connection
  try {
    await connect();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
  }

  // Initialize authentication
  try {
    await initAuth();
    logger.info('Authentication initialized');
  } catch (error) {
    logger.error('Failed to initialize auth', { error });
    process.exit(1);
  }

  // Create Fastify server
  const fastify = await registerRoutes();

  // Initialize WebSocket
  await initWebSocket(fastify);

  // Start server
  const port = config.port || 3000;
  const host = config.host || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    logger.info('Debatr API listening', { host, port });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info('Received signal, shutting down gracefully', { signal });
    await fastify.close();
    await disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Unhandled error during startup', { error });
  process.exit(1);
});
