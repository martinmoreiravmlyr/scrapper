import type { Connector } from "../types";

export function createStubConnector(
  name: string,
  strategy: Connector["strategy"],
  seedUrls: string[]
): Connector {
  return {
    name,
    strategy,
    seedUrls,
    async discoverListingUrls() {
      return seedUrls;
    },
    async parseDetailPage(url: string) {
      return {
        portal: name,
        url,
        todo: "implementar parser real"
      };
    }
  };
}
