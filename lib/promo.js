// Promoción para toda la tienda (se configura en el admin).
//   { type: "none" }                       → sin promo
//   { type: "percent", percent: 20 }       → 20% OFF en todo
//   { type: "bundle", bundle: "2x1" }      → llevás 2, pagás 1 (el de menor valor sale gratis)
// Se usa igual en la tienda, el carrito y el mensaje de WhatsApp, así los números coinciden siempre.

export const PROMO_BUNDLES = [
  { id: "2x1", take: 2, pay: 1 },
  { id: "3x2", take: 3, pay: 2 },
  { id: "4x3", take: 4, pay: 3 }
];

export const PROMO_PERCENT = { min: 5, max: 90 };

export const NO_PROMO = { type: "none", percent: 20, bundle: "2x1" };

export function normalizePromo(value) {
  const percent = Math.round(Number(value?.percent));
  const promo = {
    type: ["none", "percent", "bundle"].includes(value?.type) ? value.type : "none",
    percent: percent >= PROMO_PERCENT.min && percent <= PROMO_PERCENT.max ? percent : NO_PROMO.percent,
    bundle: PROMO_BUNDLES.some((item) => item.id === value?.bundle) ? value.bundle : NO_PROMO.bundle
  };
  return promo;
}

export function isPromoActive(promo) {
  return promo?.type === "percent" || promo?.type === "bundle";
}

// Texto corto para badges y para el mensaje: "2x1", "20% OFF"
export function promoLabel(promo) {
  if (promo?.type === "percent") return `${promo.percent}% OFF`;
  if (promo?.type === "bundle") return promo.bundle;
  return "";
}

export function promoDescription(promo) {
  if (promo?.type === "percent") return `${promo.percent}% de descuento en todos los productos.`;
  if (promo?.type === "bundle") {
    const bundle = bundleOf(promo);
    return `Llevás ${bundle.take} y pagás ${bundle.pay}: en cada grupo de ${bundle.take}, ${bundle.take - bundle.pay === 1 ? "el de menor valor sale gratis" : `los ${bundle.take - bundle.pay} de menor valor salen gratis`}.`;
  }
  return "";
}

// Precio unitario con la promo (solo cambia con porcentaje; el 2x1 se calcula en el carrito).
export function promoUnitPrice(price, promo) {
  if (promo?.type !== "percent") return price;
  return Math.round(price * (1 - promo.percent / 100));
}

// items: [{ price, quantity }] → { subtotal, discount, total, freeUnits }
export function applyPromo(items, promo) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  let freeUnits = 0;

  if (promo?.type === "percent") {
    const total = items.reduce((sum, item) => sum + promoUnitPrice(item.price, promo) * item.quantity, 0);
    discount = subtotal - total;
  } else if (promo?.type === "bundle") {
    const { take, pay } = bundleOf(promo);
    // Todas las unidades, de la más cara a la más barata; en cada grupo completo, las más baratas van gratis.
    const units = items.flatMap((item) => Array.from({ length: item.quantity }, () => item.price)).sort((a, b) => b - a);
    for (let start = 0; start + take <= units.length; start += take) {
      const group = units.slice(start, start + take);
      for (const price of group.slice(pay)) {
        discount += price;
        freeUnits += 1;
      }
    }
  }

  return { subtotal, discount, total: subtotal - discount, freeUnits };
}

function bundleOf(promo) {
  return PROMO_BUNDLES.find((item) => item.id === promo?.bundle) || PROMO_BUNDLES[0];
}
