export const FORMAT_CATALOG = [
  { id: "eau_de_parfum", label: "Eau de Parfum", price_cents: 8900, description: "Classic 50ml spray" },
  { id: "parfum",        label: "Parfum Extrait", price_cents: 12900, description: "Pure 30ml concentration" },
  { id: "oil",           label: "Fragrance Oil",  price_cents: 6900,  description: "15ml roll-on" },
  { id: "candle",        label: "Scented Candle", price_cents: 5900,  description: "200g soy wax" },
  { id: "diffuser",      label: "Reed Diffuser",  price_cents: 7900,  description: "100ml reed set" },
] as const;

export type FormatId = typeof FORMAT_CATALOG[number]["id"];

export function formatPrice(priceCents: number): string {
  return `₹${(priceCents / 100).toFixed(0)}`;
}

export function getCatalogItem(id: FormatId) {
  const found = FORMAT_CATALOG.find((f) => f.id === id);
  if (!found) {
    throw new Error(`Catalog item ${id} not found`);
  }
  return found;
}
