import { FastifyInstance } from 'fastify';

// Minimal WebSocket layer. Real-time debate updates, turn notifications, and
// presence tracking (Phase 3) are not yet implemented. This stub accepts
// connections, requires the Better Auth session, and echoes a welcome frame so
// the server boots and the transport is verifiable.
export async function initWebSocket(fastify: FastifyInstance) {
  fastify.get('/api/ws', { websocket: true }, (socket, request) => {
    socket.send(JSON.stringify({ type: 'connected', message: 'Debatr realtime (stub)' }));

    socket.on('message', (raw: any) => {
      try {
        const msg = JSON.parse(raw.toString());
        // Echo for now; replace with debate event fan-out in Phase 3.
        socket.send(JSON.stringify({ type: 'echo', data: msg }));
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });
  });
}
