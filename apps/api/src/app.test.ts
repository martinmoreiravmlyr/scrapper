import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "./app";

test("GET /health returns service health", async () => {
  const app = await buildApp({ logger: false });
  const response = await app.inject({ method: "GET", url: "/health" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });

  await app.close();
});

test("GET /status returns configured portals and queue states", async () => {
  const app = await buildApp({ logger: false });
  const response = await app.inject({ method: "GET", url: "/status" });
  const body = response.json();

  assert.equal(response.statusCode, 200);
  assert.equal(body.service, "api");
  assert.deepEqual([...body.portals].sort(), [
    "casasweb",
    "casasymas",
    "gallito",
    "infocasas",
    "mercadolibre",
    "remax"
  ]);
  assert.deepEqual(Object.keys(body.queues).sort(), [
    "crawlDetail",
    "crawlList",
    "dedupe",
    "normalize"
  ]);

  await app.close();
});
