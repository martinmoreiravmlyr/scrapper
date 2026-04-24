import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "/api";

const PORTALS = [
  { value: "infocasas", label: "InfoCasas" },
];

const OPERATIONS = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "temporal", label: "Temporal" },
];

const CITIES = [
  { value: "", label: "Todas las ciudades" },
  { value: "montevideo", label: "Montevideo" },
  { value: "punta-del-este", label: "Punta del Este" },
  { value: "maldonado", label: "Maldonado" },
  { value: "ciudad-de-la-costa", label: "Ciudad de la Costa" },
  { value: "piriapolis", label: "Piriápolis" },
  { value: "colonia", label: "Colonia" },
  { value: "rocha", label: "Rocha" },
  { value: "paysandu", label: "Paysandú" },
  { value: "salto", label: "Salto" },
];

type Property = {
  id: number;
  title: string | null;
  price: number | null;
  currency: string | null;
  city: string | null;
  operation_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  total_m2: number | null;
  description: string | null;
  created_at: string;
};

type StatusResponse = {
  ok: boolean;
  propertyCount: number;
  portals: string[];
};

function buildUrl(base: string, operation: string, city: string): string {
  const parts = [base, operation];
  if (city) parts.push(city);
  return parts.join("/");
}

export default function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);

  const [portal, setPortal] = useState("infocasas");
  const [operation, setOperation] = useState("alquiler");
  const [city, setCity] = useState("montevideo");
  const [filterCity, setFilterCity] = useState("");
  const [filterOperation, setFilterOperation] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterOrder, setFilterOrder] = useState<"newest" | "price_asc" | "price_desc">("price_asc");
  const [crawlResult, setCrawlResult] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch(`${apiUrl}/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));

    const params = new URLSearchParams();
    if (filterCity) params.set("city", filterCity);
    if (filterOperation) params.set("operation", filterOperation);
    if (filterPriceMax) params.set("price_max", filterPriceMax);
    params.set("order", filterOrder);

    fetch(`${apiUrl}/properties?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProperties(data.properties || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterCity, filterOperation, filterPriceMax, filterOrder]);

  const doCrawl = async () => {
    setCrawling(true);
    setCrawlResult("Scrapeando...");
    const url = buildUrl("https://www.infocasas.com.uy", operation, city);
    try {
      const res = await fetch(`${apiUrl}/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal, url })
      });
      const data = await res.json();
      setCrawlResult(`Encontradas ${data.found}, guardadas ${data.saved}, errores ${data.errors}`);
      loadData();
    } catch (e) {
      setCrawlResult("Error: " + (e as Error).message);
    } finally {
      setCrawling(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <h1>URU Scraper Dashboard</h1>
        <p>
          {status ? `${status.propertyCount} propiedades indexadas` : "Cargando..."}
        </p>
        <button onClick={loadData} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </section>

      <section className="grid">
        <article className="card wide">
          <h2>Buscar y Scrapear</h2>
          <div className="form crawl-form">
            <select value={portal} onChange={(e) => setPortal(e.target.value)}>
              {PORTALS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select value={operation} onChange={(e) => setOperation(e.target.value)}>
              {OPERATIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button onClick={doCrawl} disabled={crawling} className="btn-primary">
              {crawling ? "Scrapeando..." : "Scrapear"}
            </button>
          </div>
          {crawlResult && <p className="result">{crawlResult}</p>}
        </article>

        <article className="card wide">
          <h2>Filtros</h2>
          <div className="form filters">
            <input
              type="text"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              placeholder="Ciudad o barrio"
            />
            <select value={filterOperation} onChange={(e) => setFilterOperation(e.target.value)}>
              <option value="">Todas las operaciones</option>
              {OPERATIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={filterPriceMax}
              onChange={(e) => setFilterPriceMax(e.target.value)}
              placeholder="Precio máximo"
            />
            <select value={filterOrder} onChange={(e) => setFilterOrder(e.target.value as any)}>
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </div>
        </article>

        <article className="card wide">
          <h2>Propiedades ({properties.length})</h2>
          {properties.length === 0 ? (
            <p>No hay propiedades. Elegí una ciudad y operación arriba, y hacé click en <b>Scrapear</b> para buscar.</p>
          ) : (
            <div className="properties">
              {properties.map((p) => (
                <div key={p.id} className="property-card">
                  <h3>{p.title ?? "Sin título"}</h3>
                  <div className="meta">
                    {p.price && <span className="price">{p.currency} {p.price.toLocaleString()}</span>}
                    {p.operation_type && <span className="badge op">{p.operation_type}</span>}
                    {p.city && <span className="badge">{p.city}</span>}
                    {p.bedrooms != null && <span>{p.bedrooms} dorm</span>}
                    {p.bathrooms != null && <span>{p.bathrooms} baño</span>}
                    {p.total_m2 != null && <span>{p.total_m2} m²</span>}
                  </div>
                  {p.description && <p className="desc">{p.description.substring(0, 120)}...</p>}
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <h2>Estado</h2>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}
