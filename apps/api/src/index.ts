import { config } from './config/env.js';
import { db } from './db/index.js';
import { auth } from './auth/index.js';
import { registerRoutes } from './routes/index.js';
import { initWebSocket } from './websocket/index.js';

async function main() {
  console.log('Starting Debatr API...');
  
  // Validate configuration
  if (!config.validate()) {
    console.error('Configuration validation failed. Check environment variables.');
    process.exit(1);
  }
  
  console.log('Configuration validated successfully');
  
  // Initialize database connection
  try {
    await db.connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
  
  // Initialize authentication
  try {
    await auth.init();
    console.log('Authentication initialized');
  } catch (error) {
    console.error('Failed to initialize auth:', error.message);
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
    console.log(`Debatr API listening on ${host}:${port}`);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
  
  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    await fastify.close();
    await db.disconnect();
    process.exit(0);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  console.error('Unhandled error during startup:', error);
  process.exit(1);
});
