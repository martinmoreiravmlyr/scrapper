import { infocasasConnector } from "./connectors/infocasas";
import { gallitoConnector } from "./connectors/gallito";
import { casaswebConnector } from "./connectors/casasweb";
import { remaxConnector } from "./connectors/remax";
import { casasymasConnector } from "./connectors/casasymas";
import { mercadolibreConnector } from "./connectors/mercadolibre";

export const allConnectors = [
  infocasasConnector,
  gallitoConnector,
  casaswebConnector,
  remaxConnector,
  casasymasConnector,
  mercadolibreConnector
];

export * from "./types";
