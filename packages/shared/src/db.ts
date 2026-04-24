import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace("sqlite:", "")
  : path.join(dataDir, "uru_scraper.db");

const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portal TEXT NOT NULL,
      listing_url TEXT NOT NULL UNIQUE,
      external_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_crawled_at TEXT,
      raw_html TEXT,
      raw_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER REFERENCES sources(id) ON DELETE CASCADE,
      operation_type TEXT,
      property_type TEXT,
      department TEXT,
      city TEXT,
      neighborhood TEXT,
      address_text TEXT,
      price REAL,
      currency TEXT,
      bedrooms INTEGER,
      bathrooms INTEGER,
      covered_m2 REAL,
      total_m2 REAL,
      garage INTEGER,
      title TEXT,
      description TEXT,
      agency_name TEXT,
      published_at_source TEXT,
      updated_at_source TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS property_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      position INTEGER,
      image_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS crawl_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portal TEXT NOT NULL,
      job_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      items_found INTEGER NOT NULL DEFAULT 0,
      items_processed INTEGER NOT NULL DEFAULT 0,
      errors_count INTEGER NOT NULL DEFAULT 0,
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_sources_portal ON sources(portal);
    CREATE INDEX IF NOT EXISTS idx_properties_source ON properties(source_id);
  `);
}

export type SourceRow = {
  id: number;
  portal: string;
  listing_url: string;
  external_id: string | null;
  status: string;
  first_seen_at: string;
  last_seen_at: string;
  last_crawled_at: string | null;
  raw_html: string | null;
  raw_json: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyRow = {
  id: number;
  source_id: number | null;
  operation_type: string | null;
  property_type: string | null;
  department: string | null;
  city: string | null;
  neighborhood: string | null;
  address_text: string | null;
  price: number | null;
  currency: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  covered_m2: number | null;
  total_m2: number | null;
  garage: number | null;
  title: string | null;
  description: string | null;
  agency_name: string | null;
  published_at_source: string | null;
  updated_at_source: string | null;
  created_at: string;
  updated_at: string;
};

export function insertOrUpdateSource(
  portal: string,
  listingUrl: string,
  externalId?: string,
  rawHtml?: string
): number {
  const existing = db
    .prepare("SELECT id FROM sources WHERE listing_url = ?")
    .get(listingUrl) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE sources
       SET last_seen_at = CURRENT_TIMESTAMP, external_id = ?, raw_html = ?
       WHERE id = ?`
    ).run(externalId ?? null, rawHtml ?? null, existing.id);
    return existing.id;
  }

  const result = db.prepare(
    `INSERT INTO sources (portal, listing_url, external_id, raw_html)
     VALUES (?, ?, ?, ?)`
  ).run(portal, listingUrl, externalId ?? null, rawHtml ?? null);
  return Number(result.lastInsertRowid);
}

export function insertProperty(props: Omit<PropertyRow, "id" | "created_at" | "updated_at">): number {
  const result = db.prepare(
    `INSERT INTO properties (
      source_id, operation_type, property_type, department, city,
      neighborhood, address_text, price, currency, bedrooms, bathrooms,
      covered_m2, total_m2, garage, title, description, agency_name,
      published_at_source, updated_at_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    props.source_id ?? null,
    props.operation_type ?? null,
    props.property_type ?? null,
    props.department ?? null,
    props.city ?? null,
    props.neighborhood ?? null,
    props.address_text ?? null,
    props.price ?? null,
    props.currency ?? null,
    props.bedrooms ?? null,
    props.bathrooms ?? null,
    props.covered_m2 ?? null,
    props.total_m2 ?? null,
    props.garage ?? null,
    props.title ?? null,
    props.description ?? null,
    props.agency_name ?? null,
    props.published_at_source ?? null,
    props.updated_at_source ?? null
  );
  return Number(result.lastInsertRowid);
}

export function getAllProperties(): PropertyRow[] {
  return db.prepare("SELECT * FROM properties ORDER BY created_at DESC").all() as PropertyRow[];
}

export function getFilteredProperties(
  city?: string,
  operation?: string,
  priceMax?: number,
  orderBy: "price_asc" | "price_desc" | "newest" = "newest"
): PropertyRow[] {
  let sql = "SELECT * FROM properties WHERE 1=1";
  const params: (string | number)[] = [];

  if (city) {
    sql += " AND (city LIKE ? OR neighborhood LIKE ? OR address_text LIKE ?)";
    const like = `%${city}%`;
    params.push(like, like, like);
  }
  if (operation) {
    sql += " AND operation_type = ?";
    params.push(operation);
  }
  if (priceMax != null && !isNaN(priceMax)) {
    sql += " AND price <= ? AND price IS NOT NULL";
    params.push(priceMax);
  }

  if (orderBy === "price_asc") sql += " ORDER BY price ASC";
  else if (orderBy === "price_desc") sql += " ORDER BY price DESC";
  else sql += " ORDER BY created_at DESC";

  return db.prepare(sql).all(...params) as PropertyRow[];
}

export function getPropertyCount(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM properties").get() as { count: number };
  return row.count;
}

export function getSourcesByPortal(portal: string): SourceRow[] {
  return db.prepare("SELECT * FROM sources WHERE portal = ? ORDER BY created_at DESC").all(portal) as SourceRow[];
}

export function getJobStats(): Record<string, number> {
  const rows = db.prepare(
    "SELECT portal, COUNT(*) as count FROM sources GROUP BY portal"
  ).all() as { portal: string; count: number }[];
  return Object.fromEntries(rows.map((r) => [r.portal, r.count]));
}

export function insertCrawlJob(portal: string, jobType: string): number {
  const result = db.prepare(
    "INSERT INTO crawl_jobs (portal, job_type, status) VALUES (?, ?, 'running')"
  ).run(portal, jobType);
  return Number(result.lastInsertRowid);
}

export function updateCrawlJob(
  id: number,
  status: string,
  itemsFound?: number,
  itemsProcessed?: number,
  errorsCount?: number
) {
  db.prepare(
    `UPDATE crawl_jobs
     SET status = ?, items_found = ?, items_processed = ?, errors_count = ?, finished_at = ?
     WHERE id = ?`
  ).run(
    status,
    itemsFound ?? 0,
    itemsProcessed ?? 0,
    errorsCount ?? 0,
    status !== "running" ? new Date().toISOString() : null,
    id
  );
}

export { db };
