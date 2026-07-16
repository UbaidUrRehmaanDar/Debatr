import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { app, server } from "@debatr/config";
import { createDebateSchema } from "@debatr/shared";

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(websocket);

  fastify.get("/health", async () => ({ status: "ok", app: app.name }));

  fastify.post("/api/debates", async (request, reply) => {
    const result = createDebateSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ error: result.error.flatten() });
    }
    return reply.code(201).send({
      id: crypto.randomUUID(),
      ...result.data,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  });

  fastify.register(async (instance) => {
    instance.get("/ws", { websocket: true }, (socket) => {
      socket.on("message", (message: Buffer) => {
        socket.send(`echo: ${message.toString()}`);
      });
    });
  });

  return fastify;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fastify = await buildServer();
  fastify.listen({ host: server.host, port: server.port });
}
