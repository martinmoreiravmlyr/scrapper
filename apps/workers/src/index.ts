import "dotenv/config";
import { allConnectors } from "@uru-scraper/connectors";

console.log("workers listos");
console.log("portales cargados:", allConnectors.map((c) => c.name).join(", "));

setInterval(() => {
  console.log("heartbeat workers", new Date().toISOString());
}, 10000);
