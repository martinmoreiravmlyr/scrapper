import test from "node:test";
import assert from "node:assert/strict";
import { allConnectors } from "./index";

test("exports one connector per supported portal with unique names", () => {
  const names = allConnectors.map((connector) => connector.name);

  assert.deepEqual([...names].sort(), [
    "casasweb",
    "casasymas",
    "gallito",
    "infocasas",
    "mercadolibre",
    "remax"
  ]);
  assert.equal(new Set(names).size, names.length);
});

test("connectors expose valid seed URLs and normalized detail stubs", async () => {
  for (const connector of allConnectors) {
    assert.ok(connector.seedUrls.length > 0, `${connector.name} should have seeds`);

    for (const seedUrl of connector.seedUrls) {
      assert.doesNotThrow(() => new URL(seedUrl));
    }

    const [seedUrl] = await connector.discoverListingUrls();
    assert.equal(typeof seedUrl, "string");

    const parsed = await connector.parseDetailPage(seedUrl);
    assert.equal(parsed.portal, connector.name);
    assert.equal(parsed.listingUrl, seedUrl);
    assert.equal(parsed.extractionStatus, "stub");
  }
});
