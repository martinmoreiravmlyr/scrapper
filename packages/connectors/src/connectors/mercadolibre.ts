import { createStubConnector } from "./base";

export const mercadolibreConnector = createStubConnector(
  "mercadolibre",
  "api-first",
  ["https://listado.mercadolibre.com.uy/casas"]
);
