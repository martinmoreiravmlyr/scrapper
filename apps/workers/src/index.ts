import "dotenv/config";
import { allConnectors } from "@uru-scraper/connectors";
import { initDb, insertOrUpdateSource, insertProperty, getJobStats, insertCrawlJob, updateCrawlJob } from "@uru-scraper/shared";

initDb();

async function runCrawl() {
  console.log("[workers] Iniciando crawl...", new Date().toISOString());

  for (const connector of allConnectors) {
    const jobId = insertCrawlJob(connector.name, "crawlList");
    console.log(`[${connector.name}] Procesando...`);

    try {
      const listingUrls = await connector.discoverListingUrls();
      let found = 0;
      let processed = 0;

      for (const listingUrl of listingUrls) {
        console.log(`[${connector.name}] Listado: ${listingUrl}`);
        const html = await fetch(listingUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(r => r.text());

        const propertyUrls = await connector.parseListingPage(html, listingUrl);
        console.log(`[${connector.name}] Encontradas ${propertyUrls.length} propiedades`);
        found += propertyUrls.length;

        for (const url of propertyUrls.slice(0, 5)) {
          try {
            const prop = await connector.parseDetailPage(url);
            const sourceId = insertOrUpdateSource(
              connector.name,
              prop.listingUrl,
              prop.externalId
            );
            insertProperty({
              source_id: sourceId,
              operation_type: prop.operationType ?? null,
              property_type: prop.propertyType ?? null,
              department: prop.department ?? null,
              city: prop.city ?? null,
              neighborhood: prop.neighborhood ?? null,
              address_text: prop.addressText ?? null,
              price: prop.price ?? null,
              currency: prop.currency ?? null,
              bedrooms: prop.bedrooms ?? null,
              bathrooms: prop.bathrooms ?? null,
              covered_m2: prop.coveredM2 ?? null,
              total_m2: prop.totalM2 ?? null,
              garage: prop.garage ? 1 : 0,
              title: prop.title ?? null,
              description: prop.description ?? null,
              agency_name: prop.agencyName ?? null,
              published_at_source: null,
              updated_at_source: null
            });
            processed++;
          } catch (e) {
            console.error(`[${connector.name}] Error en ${url}:`, (e as Error).message);
          }
        }
      }

      updateCrawlJob(jobId, "completed", found, processed);
      console.log(`[${connector.name}] Completado: ${processed}/${found} procesados`);
    } catch (e) {
      console.error(`[${connector.name}] Error:`, (e as Error).message);
      updateCrawlJob(jobId, "failed");
    }
  }

  const stats = getJobStats();
  console.log("[workers] Stats:", stats);
}

runCrawl().then(() => {
  console.log("[workers] Crawl terminado");
  setInterval(() => {
    console.log("[workers] heartbeat", new Date().toISOString());
  }, 10000);
}).catch(console.error);
