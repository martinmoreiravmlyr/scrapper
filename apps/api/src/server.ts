import "dotenv/config";
import { buildApp } from "./app";

const port = Number(process.env.API_PORT || 3001);
const app = await buildApp({ logger: true });

try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API escuchando en http://localhost:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
