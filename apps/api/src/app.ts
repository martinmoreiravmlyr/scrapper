import cors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";
import { defaultQueueStates, PORTALS, initDb, getAllProperties, getFilteredProperties, getPropertyCount, getJobStats, insertOrUpdateSource, insertProperty } from "@uru-scraper/shared";
import { crawlPortal } from "@uru-scraper/connectors";

initDb();

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true }));

  app.get("/status", async () => ({
    ok: true,
    service: "api",
    portals: [...PORTALS],
    queues: defaultQueueStates(),
    stats: getJobStats(),
    propertyCount: getPropertyCount()
  }));

  app.get("/portals", async () => ({
    portals: PORTALS.map((portal) => ({ portal, enabled: true }))
  }));

  app.get("/properties", async (req) => {
    const q = req.query as Record<string, string>;
    const city = q.city || undefined;
    const operation = q.operation || undefined;
    const priceMax = q.price_max ? parseFloat(q.price_max) : undefined;
    const orderBy = (q.order as "price_asc" | "price_desc" | "newest") || "newest";

    const properties = getFilteredProperties(city, operation, priceMax, orderBy);
    return { count: properties.length, properties };
  });

  app.post("/crawl", async (req) => {
    const body = req.body as { portal: string; url: string };
    const { portal, url } = body;

    const result = await crawlPortal(portal, url, (_portal, listingUrl, raw) => {
      const prop = raw as Record<string, unknown>;
      const sourceId = insertOrUpdateSource(_portal, listingUrl, prop.externalId as string | undefined);
      insertProperty({
        source_id: sourceId,
        operation_type: prop.operationType as string | null ?? null,
        property_type: null,
        department: prop.department as string | null ?? null,
        city: prop.city as string | null ?? null,
        neighborhood: prop.neighborhood as string | null ?? null,
        address_text: prop.addressText as string | null ?? null,
        price: prop.price as number | null ?? null,
        currency: prop.currency as string | null ?? null,
        bedrooms: prop.bedrooms as number | null ?? null,
        bathrooms: prop.bathrooms as number | null ?? null,
        covered_m2: prop.coveredM2 as number | null ?? null,
        total_m2: prop.totalM2 as number | null ?? null,
        garage: !!prop.garage ? 1 : 0,
        title: prop.title as string | null ?? null,
        description: prop.description as string | null ?? null,
        agency_name: prop.agencyName as string | null ?? null,
        published_at_source: null,
        updated_at_source: null
      });
    });

    return { ok: true, portal, url, ...result };
  });

  app.get("/", async () => ({
    name: "uru-scraper-api",
    message: "API base lista"
  }));

  return app;
}
