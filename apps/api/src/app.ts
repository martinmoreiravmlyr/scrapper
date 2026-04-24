import cors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";
import { defaultQueueStates, PORTALS } from "@uru-scraper/shared";

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true }));

  app.get("/status", async () => ({
    ok: true,
    service: "api",
    portals: [...PORTALS],
    queues: defaultQueueStates()
  }));

  app.get("/portals", async () => ({
    portals: PORTALS.map((portal) => ({ portal, enabled: true }))
  }));

  app.get("/", async () => ({
    name: "uru-scraper-api",
    message: "API base lista"
  }));

  return app;
}
