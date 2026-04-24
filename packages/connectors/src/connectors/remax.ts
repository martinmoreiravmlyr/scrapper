import { createStubConnector } from "./base";

export const remaxConnector = createStubConnector(
  "remax",
  "puppeteer",
  ["https://www.remax.com.uy/"]
);
