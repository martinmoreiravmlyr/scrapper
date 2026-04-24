import type { NormalizedProperty, PortalName } from "@uru-scraper/shared";
import type { Connector, ConnectorStrategy } from "../types";

function assertValidUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid connector URL: ${url}`);
  }
}

export function extractIdFromUrl(url: string): string | undefined {
  const parsed = new URL(url);
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  return pathParts.at(-1);
}

export function createStubConnector(
  name: PortalName,
  strategy: ConnectorStrategy,
  seedUrls: string[],
  displayName: string = name
): Connector {
  seedUrls.forEach(assertValidUrl);

  return {
    name,
    displayName,
    strategy,
    seedUrls,
    async discoverListingUrls() {
      return seedUrls;
    },
    async parseListingPage() {
      return seedUrls;
    },
    async parseDetailPage(url: string) {
      assertValidUrl(url);
      return {
        portal: name,
        listingUrl: url,
        externalId: extractIdFromUrl(url),
        extractionStatus: "stub"
      };
    },
    async normalizeProperty(raw: Record<string, unknown>): Promise<NormalizedProperty> {
      const listingUrl = String(raw.listingUrl ?? raw.url ?? seedUrls[0]);
      assertValidUrl(listingUrl);

      return {
        portal: name,
        listingUrl,
        externalId: typeof raw.externalId === "string" ? raw.externalId : extractIdFromUrl(listingUrl),
        title: typeof raw.title === "string" ? raw.title : undefined,
        extractionStatus: "stub"
      };
    },
    extractExternalId(url: string) {
      assertValidUrl(url);
      return extractIdFromUrl(url);
    }
  };
}
