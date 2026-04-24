import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

execFileSync("npx", ["tsc", "-p", "tsconfig.build.json", "--noEmit"], { stdio: "inherit" });

mkdirSync("dist", { recursive: true });

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>URU Scraper API</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #111827; color: #f9fafb; }
      main { max-width: 760px; margin: 0 auto; padding: 48px 24px; }
      a { color: #93c5fd; }
      code { background: #1f2937; padding: 2px 6px; border-radius: 6px; }
      .card { background: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 20px; }
    </style>
  </head>
  <body>
    <main>
      <h1>URU Scraper API</h1>
      <div class="card">
        <p>El workspace <code>apps/api</code> compiló correctamente.</p>
        <p>Endpoints disponibles en este deploy:</p>
        <ul>
          <li><code>/health</code></li>
          <li><code>/status</code></li>
          <li><code>/portals</code></li>
          <li><code>/api/health</code></li>
          <li><code>/api/status</code></li>
          <li><code>/api/portals</code></li>
        </ul>
        <p>Para desplegar el dashboard completo en Vercel, configurá <strong>Root Directory</strong> como <code>.</code> y <strong>Output Directory</strong> como <code>apps/web/dist</code>.</p>
      </div>
    </main>
  </body>
</html>
`;

writeFileSync("dist/index.html", html);

const serverEntrypoint = `const html = ${JSON.stringify(html)};

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function sendHtml(response) {
  response.statusCode = 200;
  response.setHeader("content-type", "text/html; charset=utf-8");
  response.end(html);
}

export default function handler(request, response) {
  const url = new URL(request.url || "/", "http://localhost");

  if (url.pathname === "/health" || url.pathname === "/api/health") {
    return sendJson(response, 200, { ok: true });
  }

  if (url.pathname === "/status" || url.pathname === "/api/status") {
    return sendJson(response, 200, {
      ok: true,
      service: "api",
      portals: ["infocasas", "gallito", "casasweb", "remax", "casasymas", "mercadolibre"],
      queues: { crawlList: "idle", crawlDetail: "idle", normalize: "idle", dedupe: "idle" }
    });
  }

  if (url.pathname === "/portals" || url.pathname === "/api/portals") {
    return sendJson(response, 200, {
      portals: ["infocasas", "gallito", "casasweb", "remax", "casasymas", "mercadolibre"].map((portal) => ({ portal, enabled: true }))
    });
  }

  return sendHtml(response);
}
`;

writeFileSync("dist/index.js", serverEntrypoint);
writeFileSync("dist/app.js", serverEntrypoint);

console.log("API workspace build completed and dist/index.html, dist/index.js, dist/app.js generated");
