import { FastifyInstance } from 'fastify';
import { getAuth } from '../auth/index.js';
import { debateEvents } from '../debates/events.js';
import { getDb } from '../db/index.js';
import { debates } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { sideOfUser } from '../debates/engine.js';

interface Client {
  socket: any;
  debateId: string | null;
  userId: string | null;
  side: string | null;
}

// Realtime layer. Clients connect (session cookie is sent on the upgrade
// request and validated against Better Auth), then send
// `{ type: 'subscribe', debateId }` to receive debate events and presence for
// that debate. Fan-out is in-process per docs/ARCHITECTURE.md.
export async function initWebSocket(fastify: FastifyInstance) {
  const clients = new Set<Client>();

  function presence(debateId: string) {
    const ids = new Set<string>();
    for (const c of clients) {
      if (c.debateId === debateId && c.userId) ids.add(c.userId);
    }
    return [...ids];
  }

  function broadcast(debateId: string, event: object) {
    const frame = JSON.stringify(event);
    for (const client of clients) {
      if (client.debateId === debateId) {
        try {
          client.socket.send(frame);
        } catch {
          clients.delete(client);
        }
      }
    }
  }

  function broadcastPresence(debateId: string) {
    broadcast(debateId, { type: 'presence', debateId, userIds: presence(debateId) });
  }

  debateEvents.on('debate_state_changed', (payload) => {
    broadcast(payload.debateId, { type: 'debate_state_changed', ...payload });
  });
  debateEvents.on('turn_advanced', (payload) => {
    broadcast(payload.debateId, { type: 'turn_advanced', ...payload });
  });
  debateEvents.on('message_posted', (payload) => {
    broadcast(payload.debateId, { type: 'message_posted', ...payload });
  });
  debateEvents.on('raise_hand', (payload) => {
    broadcast(payload.debateId, { type: 'raise_hand', ...payload });
  });
  debateEvents.on('raise_hand_decided', (payload) => {
    broadcast(payload.debateId, { type: 'raise_hand_decided', ...payload });
  });
  debateEvents.on('fact_checked', (payload) => {
    broadcast(payload.debateId, { type: 'fact_checked', ...payload });
  });
  debateEvents.on('typing', (payload) => {
    broadcast(payload.debateId, { type: 'typing', ...payload });
  });
  debateEvents.on('reaction', (payload) => {
    broadcast(payload.debateId, { type: 'reaction', ...payload });
  });
  debateEvents.on('ai_thinking', (payload) => {
    broadcast(payload.debateId, { type: 'ai_thinking', ...payload });
  });

  fastify.get('/api/ws', { websocket: true }, async (socket, request) => {
    // Validate session from the upgrade request's cookies.
    let userId: string | null = null;
    try {
      const session = await getAuth().api.getSession({ headers: request.headers as any });
      userId = session?.user?.id ?? null;
    } catch {
      userId = null;
    }
    if (!userId) {
      socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
      socket.close();
      return;
    }

    const client: Client = { socket, debateId: null, userId, side: null };
    clients.add(client);

    socket.send(JSON.stringify({ type: 'connected', userId }));

    socket.on('message', async (raw: any) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'subscribe' && typeof msg.debateId === 'string') {
          // Only allow subscribing to a debate the user participates in.
          const db = getDb();
          const [debate] = await db
            .select()
            .from(debates)
            .where(eq(debates.id, msg.debateId))
            .limit(1);
          if (!debate || !client.userId || !sideOfUser(debate, client.userId)) {
            socket.send(
              JSON.stringify({ type: 'error', message: 'Not a participant of this debate' }),
            );
            return;
          }
          const prev = client.debateId;
          client.debateId = msg.debateId;
          client.side = client.userId ? sideOfUser(debate, client.userId) : null;
          socket.send(JSON.stringify({ type: 'subscribed', debateId: msg.debateId }));
          if (prev !== client.debateId && client.debateId) broadcastPresence(client.debateId);
        } else if (msg.type === 'typing' && client.debateId) {
          // Echo a typing indicator for the opponent. Not persisted.
          debateEvents.emit('typing', {
            debateId: client.debateId,
            userId: client.userId ?? 'unknown',
            side: client.side ?? 'unknown',
            isTyping: Boolean(msg.isTyping),
          });
        } else if (msg.type === 'react' && client.debateId) {
          // Broadcast a transient reaction emoji (no persistence).
          debateEvents.emit('reaction', {
            debateId: client.debateId,
            userId: client.userId ?? 'unknown',
            side: client.side ?? 'unknown',
            emoji: typeof msg.emoji === 'string' ? msg.emoji.slice(0, 8) : '👍',
          });
        }
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    socket.on('close', () => {
      clients.delete(client);
      if (client.debateId) broadcastPresence(client.debateId);
    });
  });
}
