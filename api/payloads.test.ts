import test from "node:test";
import assert from "node:assert/strict";
import { healthPayload, portalsPayload, statusPayload } from "./_payloads";

test("serverless health payload is stable", () => {
  assert.deepEqual(healthPayload(), { ok: true });
});

test("serverless status payload matches scraper dashboard contract", () => {
  const status = statusPayload();

  assert.equal(status.ok, true);
  assert.equal(status.service, "api");
  assert.deepEqual([...status.portals].sort(), [
    "casasweb",
    "casasymas",
    "gallito",
    "infocasas",
    "mercadolibre",
    "remax"
  ]);
  assert.deepEqual(status.queues, {
    crawlList: "idle",
    crawlDetail: "idle",
    normalize: "idle",
    dedupe: "idle"
  });
});

test("serverless portals payload exposes enabled portals", () => {
  assert.ok(portalsPayload().portals.every((portal) => portal.enabled));
});
