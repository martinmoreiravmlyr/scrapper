import { allConnectors } from "@uru-scraper/connectors";

for (const connector of allConnectors) {
  console.log(`\n[${connector.name}]`);
  console.log("strategy:", connector.strategy);
  console.log("seeds:", connector.seedUrls.join(", "));
}
