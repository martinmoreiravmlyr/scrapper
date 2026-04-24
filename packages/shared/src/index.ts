export type PortalName =
  | "infocasas"
  | "gallito"
  | "casasweb"
  | "remax"
  | "casasymas"
  | "mercadolibre";

export type PropertySeed = {
  portal: PortalName;
  url: string;
  operation: "venta" | "alquiler" | "temporal";
};
