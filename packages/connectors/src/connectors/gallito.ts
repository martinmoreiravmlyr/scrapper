import { createStubConnector } from "./base";

export const gallitoConnector = createStubConnector(
  "gallito",
  "http",
  ["https://www.gallito.com.uy/inmuebles"],
  "Gallito"
);
