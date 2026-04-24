import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

type StatusResponse = {
  ok: boolean;
  service: string;
  portals: string[];
  queues: Record<string, string>;
};

export default function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <h1>URU Scraper Dashboard</h1>
        <p>Starter para scraping inmobiliario en Uruguay.</p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Estado API</h2>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </article>

        <article className="card">
          <h2>Portales objetivo</h2>
          <ul>
            <li>InfoCasas</li>
            <li>Gallito</li>
            <li>Casasweb</li>
            <li>REMAX</li>
            <li>Casas y Más</li>
            <li>Mercado Libre</li>
          </ul>
        </article>

        <article className="card">
          <h2>Siguiente paso</h2>
          <p>
            Implementar conectores reales en <code>packages/connectors</code> y
            conectar workers con PostgreSQL y Redis.
          </p>
        </article>
      </section>
    </main>
  );
}
