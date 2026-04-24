import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });
const port = Number(process.env.API_PORT || 3001);

await app.register(cors, { origin: true });

app.get("/health", async () => ({ ok: true }));

app.get("/status", async () => ({
  ok: true,
  service: "api",
  portals: [
    "infocasas",
    "gallito",
    "casasweb",
    "remax",
    "casasymas",
    "mercadolibre"
  ],
  queues: {
    crawlList: "idle",
    crawlDetail: "idle",
    normalize: "idle",
    dedupe: "idle"
  }
}));

app.get("/", async () => ({
  name: "uru-scraper-api",
  message: "API base lista"
}));

app.listen({ port, host: "0.0.0.0" }).then(() => {
  app.log.info(`API escuchando en http://localhost:${port}`);
});
