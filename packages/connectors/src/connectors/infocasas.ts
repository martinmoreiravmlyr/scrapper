import * as cheerio from "cheerio";
import puppeteer from "puppeteer-core";
import type { NormalizedProperty } from "@uru-scraper/shared";
import type { Connector } from "../types";

const BASE_URL = "https://www.infocasas.com.uy";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

let browser: puppeteer.Browser | null = null;

async function getBrowser(): Promise<puppeteer.Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
  return browser;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

function extractIdFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.at(-1) ?? undefined;
  } catch {
    return undefined;
  }
}

function getOperationTypeFromUrl(url: string): "venta" | "alquiler" | "temporal" | undefined {
  if (url.includes("/alquiler")) return "alquiler";
  if (url.includes("/temporal")) return "temporal";
  if (url.includes("/venta")) return "venta";
  return undefined;
}

function getCityFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // InfoCasas URL pattern: /venta/inmuebles-en-colonia/propiedad-id
    // Extract city from "inmuebles-en-{ciudad}"
    for (const part of parts) {
      if (part.toLowerCase().startsWith("inmuebles-en-")) {
        return part.replace(/^inmuebles-en-/i, "").replace(/-/g, " ");
      }
    }
    // Fallback: skip known segments and return first remaining slug
    const skip = new Set(["venta", "alquiler", "temporal", "inmuebles"]);
    for (const part of parts) {
      const lower = part.toLowerCase();
      if (!skip.has(lower) && !/^\d+$/.test(part) && !part.startsWith("propiedad")) {
        return part.replace(/-/g, " ");
      }
    }
  } catch { /* ignore */ }
  return undefined;
}

export const infocasasConnector: Connector = {
  name: "infocasas",
  displayName: "InfoCasas",
  strategy: "puppeteer",
  seedUrls: [`${BASE_URL}/venta`],

  async discoverListingUrls(): Promise<string[]> {
    return [`${BASE_URL}/venta`];
  },

  async parseListingPage(html: string): Promise<string[]> {
    const $ = cheerio.load(html);
    const links = new Set<string>();

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      // Skip pagination URLs (contain 'pagina'), only include property detail pages
      if (full.includes("/pagina")) return;
      const id = extractIdFromUrl(full);
      // Property URLs on infocasas typically have a numeric or slug ID after city
      if (full.includes("/venta/") && id && !/^pagina\d+$/i.test(id)) {
        links.add(full);
      }
    });

    return Array.from(links).slice(0, 8);
  },

  async parseDetailPage(url: string): Promise<NormalizedProperty> {
    const b = await getBrowser();
    const page = await b.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 2000));
      const content = await page.content();
      const $ = cheerio.load(content);

      const title = $("h1, [class*=title], [class*=titulo]").first().text().trim() || undefined;

      // Try to extract price from visible text first, then fall back to any price-like pattern in the page
      const priceSelectors = [".price", "[class*=price]", "[class*=precio]", ".valor", "[class*=monto]", "[class*=importe]"];
      let priceText = "";
      for (const sel of priceSelectors) {
        priceText = $(sel).first().text().trim();
        if (priceText) break;
      }

      // Also search in scripts/JSON-LD if no price found
      if (!priceText) {
        $("script[type='application/ld+json']").each((_, el) => {
          try {
            const json = JSON.parse($(el).text());
            if (json.offers?.price) {
              priceText = String(json.offers.price);
            }
          } catch { /* ignore */ }
        });
      }

      let price: number | undefined;
      let currency: "USD" | "UYU" | undefined;

      // Try U$S / USD first
      const usdMatch = priceText.match(/U\$S\s*([\d.,]+)/i) || priceText.match(/USD\s*([\d.,]+)/i);
      if (usdMatch) {
        price = parseFloat(usdMatch[1].replace(/[.,]/g, ""));
        currency = "USD";
      } else {
        // Try pesos uruguayos
        const uyMatch = priceText.match(/\$\s*([\d.,]+)/);
        if (uyMatch) {
          price = parseFloat(uyMatch[1].replace(/[.,]/g, ""));
          currency = "UYU";
        }
      }

      // If still no price, search all page text for patterns like "U$S 123.456"
      if (!price) {
        const text = $("body").text();
        const looseMatch = text.match(/U\$S\s*([\d.,]+)/i) || text.match(/(\d{3,}[.,]?\d{0,3})\s*(?:dólares?|USD)/i);
        if (looseMatch) {
          price = parseFloat(looseMatch[1].replace(/[.,]/g, ""));
          currency = "USD";
        }
      }

      const descSelectors = ["[class*=description]", ".descripcion", ".descripcion-propiedad", ".detalle", "[class*=detalle]"];
      let description: string | undefined;
      for (const sel of descSelectors) {
        description = $(sel).first().text().trim();
        if (description) break;
      }

      let bedrooms: number | undefined;
      let bathrooms: number | undefined;
      let totalM2: number | undefined;
      let coveredM2: number | undefined;
      let garage = false;
      let city: string | undefined;

      const text = $("body").text();
      const bedMatch = text.match(/(\d+)\s*(?:dorm|hab|dormitorio)/i);
      if (bedMatch) bedrooms = parseInt(bedMatch[1], 10);

      const bathMatch = text.match(/(\d+)\s*(?:baño|bano|baños)/i);
      if (bathMatch) bathrooms = parseInt(bathMatch[1], 10);

      const m2Match = text.match(/(\d+)\s*m²|metros/i);
      if (m2Match) totalM2 = parseInt(m2Match[1], 10);

      const coverMatch = text.match(/(\d+)\s*m²\s*cubiertos?/i);
      if (coverMatch) coveredM2 = parseInt(coverMatch[1], 10);

      if (text.match(/garage|cochera|estacionamiento/i)) garage = true;

      // Try to find city from URL first (most reliable), then from page text
      city = getCityFromUrl(url);
      if (!city) {
        const cityRegex = /(?:en\s+)(Montevideo|Punta del Este|Ciudad de la Costa|Piriápolis|Colonia|Durazno|Rocha|Maldonado|Canelones|Salto|Paysandú)/i;
        const cityMatch = text.match(cityRegex);
        if (cityMatch) city = cityMatch[1];
      }

      const operationType = getOperationTypeFromUrl(url);

      return {
        portal: "infocasas",
        listingUrl: url,
        externalId: extractIdFromUrl(url),
        title,
        description,
        price,
        currency,
        operationType,
        city,
        bedrooms,
        bathrooms,
        coveredM2,
        totalM2,
        garage,
        extractionStatus: "parsed"
      };
    } finally {
      await page.close();
    }
  },

  async normalizeProperty(raw: Record<string, unknown>): Promise<NormalizedProperty> {
    const url = String(raw.listingUrl ?? raw.url ?? "");
    return {
      portal: "infocasas",
      listingUrl: url,
      externalId: typeof raw.externalId === "string" ? raw.externalId : extractIdFromUrl(url),
      title: typeof raw.title === "string" ? raw.title : undefined,
      description: typeof raw.description === "string" ? raw.description : undefined,
      price: typeof raw.price === "number" ? raw.price : undefined,
      currency: raw.currency === "USD" || raw.currency === "UYU" ? raw.currency : undefined,
      bedrooms: typeof raw.bedrooms === "number" ? raw.bedrooms : undefined,
      bathrooms: typeof raw.bathrooms === "number" ? raw.bathrooms : undefined,
      totalM2: typeof raw.totalM2 === "number" ? raw.totalM2 : undefined,
      garage: !!raw.garage,
      extractionStatus: "parsed"
    };
  },

  extractExternalId(url: string) {
    return extractIdFromUrl(url);
  }
};

process.on("exit", closeBrowser);
process.on("SIGINT", closeBrowser);
