import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

execFileSync("npx", ["tsc", "-p", "tsconfig.build.json", "--noEmit"], { stdio: "inherit" });

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", `<!doctype html>
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
        <p>Endpoints locales del servicio Fastify:</p>
        <ul>
          <li><code>/health</code></li>
          <li><code>/status</code></li>
          <li><code>/portals</code></li>
        </ul>
        <p>Para desplegar el dashboard completo en Vercel, configurá <strong>Root Directory</strong> como <code>.</code> y <strong>Output Directory</strong> como <code>apps/web/dist</code>.</p>
      </div>
    </main>
  </body>
</html>
`);

console.log("API workspace build completed and dist/index.html generated");
