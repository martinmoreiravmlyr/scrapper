export const PORTALS = [
  "infocasas",
  "gallito",
  "casasweb",
  "remax",
  "casasymas",
  "mercadolibre"
] as const;

export type PortalName = (typeof PORTALS)[number];

export const QUEUE_NAMES = [
  "crawlList",
  "crawlDetail",
  "normalize",
  "dedupe"
] as const;

export type QueueName = (typeof QUEUE_NAMES)[number];
export type QueueStatus = "idle" | "queued" | "running" | "failed";

export type PropertyOperation = "venta" | "alquiler" | "temporal";

export type PropertySeed = {
  portal: PortalName;
  url: string;
  operation?: PropertyOperation;
};

export type NormalizedProperty = {
  portal: PortalName;
  listingUrl: string;
  externalId?: string;
  operationType?: PropertyOperation;
  propertyType?: string;
  department?: string;
  city?: string;
  neighborhood?: string;
  addressText?: string;
  price?: number;
  currency?: "USD" | "UYU";
  bedrooms?: number;
  bathrooms?: number;
  coveredM2?: number;
  totalM2?: number;
  garage?: boolean;
  title?: string;
  description?: string;
  agencyName?: string;
  extractionStatus: "stub" | "parsed" | "failed";
};

export function isPortalName(value: string): value is PortalName {
  return (PORTALS as readonly string[]).includes(value);
}

export function defaultQueueStates(): Record<QueueName, QueueStatus> {
  return {
    crawlList: "idle",
    crawlDetail: "idle",
    normalize: "idle",
    dedupe: "idle"
  };
}
