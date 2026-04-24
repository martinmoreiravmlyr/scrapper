import { infocasasConnector } from "./connectors/infocasas";
import { gallitoConnector } from "./connectors/gallito";
import { casaswebConnector } from "./connectors/casasweb";
import { remaxConnector } from "./connectors/remax";
import { casasymasConnector } from "./connectors/casasymas";
import { mercadolibreConnector } from "./connectors/mercadolibre";

export const allConnectors = [
  infocasasConnector,
  gallitoConnector,
  casaswebConnector,
  remaxConnector,
  casasymasConnector,
  mercadolibreConnector
];

export * from "./types";

export async function crawlPortal(
  portalName: string,
  listingUrl: string,
  saveFn: (portal: string, listingUrl: string, prop: Record<string, unknown>) => void
): Promise<{ found: number; saved: number; errors: number }> {
  const connector = allConnectors.find((c) => c.name === portalName);
  if (!connector) throw new Error(`Unknown portal: ${portalName}`);

  let found = 0;
  let saved = 0;
  let errors = 0;

  const html = await fetch(listingUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  }).then((r) => r.text());

  const urls = await connector.parseListingPage(html, listingUrl);
  found = urls.length;

  for (const url of urls.slice(0, 10)) {
    try {
      const prop = await connector.parseDetailPage(url);
      saveFn(connector.name, url, prop as Record<string, unknown>);
      saved++;
    } catch {
      errors++;
    }
  }

  return { found, saved, errors };
}
