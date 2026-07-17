// Realtime client for the debate event bus. Connects to /api/ws, subscribes to
// a debate channel, and invokes the handler with ordered server events.
export type DebateEvent =
  | { type: 'connected'; message: string }
  | { type: 'subscribed'; debateId: string }
  | { type: 'debate_state_changed'; debateId: string; status: string; currentTurnId: string | null; currentRound: number }
  | { type: 'turn_advanced'; debateId: string; completed: boolean; nextTurnId: string | null }
  | { type: 'message_posted'; debateId: string; turnId: string | null; side: string; messageId: string }
  | { type: 'raise_hand'; debateId: string; requestId: string; side: string }
  | { type: 'raise_hand_decided'; debateId: string; requestId: string; status: string }
  | { type: 'presence'; debateId: string; userIds: string[] }
  | { type: 'error'; message: string };

export type WsStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthorized';

export class DebateSocket {
  private ws: WebSocket | null = null;
  private debateId: string | null = null;
  private handler: (e: DebateEvent) => void = () => {};
  private statusHandler: (s: WsStatus) => void = () => {};
  private shouldReconnect = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private readonly maxRetries = 10;
  private readonly baseDelayMs = 1000;
  private readonly maxDelayMs = 30000;

  constructor(private url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/ws`) {}

  connect(
    debateId: string,
    handler: (e: DebateEvent) => void,
    statusHandler: (s: WsStatus) => void = () => {},
  ) {
    this.debateId = debateId;
    this.handler = handler;
    this.statusHandler = statusHandler;
    this.shouldReconnect = true;
    this.attempts = 0;
    this.open();
  }

  private setStatus(s: WsStatus) {
    this.statusHandler(s);
  }

  private open() {
    this.setStatus(this.attempts === 0 ? 'connecting' : 'reconnecting');
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.attempts = 0;
      this.setStatus('connected');
      if (this.debateId) {
        this.ws!.send(JSON.stringify({ type: 'subscribe', debateId: this.debateId }));
      }
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as DebateEvent;
        // Stop reconnecting and surface a terminal state on auth failure so we
        // don't hammer the server with an unauthenticated socket.
        if (msg.type === 'error' && /unauthoriz/i.test(msg.message)) {
          this.shouldReconnect = false;
          this.setStatus('unauthorized');
          this.ws?.close();
          return;
        }
        this.handler(msg);
      } catch {
        /* ignore malformed frames */
      }
    };

    this.ws.onclose = () => {
      if (!this.shouldReconnect) {
        this.setStatus('disconnected');
        return;
      }
      if (this.attempts >= this.maxRetries) {
        this.setStatus('disconnected');
        return;
      }
      // Capped exponential backoff: base * 2^attempt, max 30s.
      const delay = Math.min(this.baseDelayMs * 2 ** this.attempts, this.maxDelayMs);
      this.attempts++;
      this.reconnectTimer = setTimeout(() => this.open(), delay);
    };

    this.ws.onerror = () => {
      // The browser fires onclose after onerror; let onclose handle reconnect.
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.ws?.close();
    this.ws = null;
    this.setStatus('disconnected');
  }
}
