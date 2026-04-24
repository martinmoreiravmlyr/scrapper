import type { NormalizedProperty, PortalName } from "@uru-scraper/shared";

export type ConnectorStrategy = "http" | "puppeteer" | "hybrid" | "api-first";

export type Connector = {
  name: PortalName;
  displayName: string;
  strategy: ConnectorStrategy;
  seedUrls: string[];
  discoverListingUrls: () => Promise<string[]>;
  parseListingPage: (html: string, sourceUrl: string) => Promise<string[]>;
  parseDetailPage: (url: string, html?: string) => Promise<NormalizedProperty>;
  normalizeProperty: (raw: Record<string, unknown>) => Promise<NormalizedProperty>;
  extractExternalId: (url: string) => string | undefined;
};
