export type Connector = {
  name: string;
  strategy: "http" | "puppeteer" | "hybrid" | "api-first";
  seedUrls: string[];
  discoverListingUrls: () => Promise<string[]>;
  parseDetailPage: (url: string) => Promise<Record<string, unknown>>;
};
