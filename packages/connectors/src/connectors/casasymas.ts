import { createStubConnector } from "./base";

export const casasymasConnector = createStubConnector(
  "casasymas",
  "puppeteer",
  ["https://www.casasymas.com.uy/"],
  "Casas y Más"
);
