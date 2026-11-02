import { site } from "@/config/site";
import { formatPrice } from "./format";

export function whatsappUrl(text) {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Arma el mensaje del pedido con el detalle de valores.
// items: [{ name, price, quantity, subcategoryName }]
export function buildOrderMessage(items, { customerName = "" } = {}) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);

  const lines = items.map((item) => {
    const subtotal = formatPrice(item.price * item.quantity);
    const unit = item.quantity > 1 ? ` (${formatPrice(item.price)} c/u)` : "";
    return `• ${item.quantity} x ${item.name}${unit} → ${subtotal}`;
  });

  const name = customerName.trim();

  return [
    "Hola, ADAPTO. Quiero hacer este pedido:",
    "",
    ...lines,
    "",
    `Unidades: ${units}`,
    `*Total: ${formatPrice(total)}*`,
    "",
    name ? `Mi nombre es ${name}.` : null,
    "¿Cómo sigo con el pago? Gracias."
  ]
    .filter((line) => line !== null)
    .join("\n");
}

// Consulta rápida desde la página de un producto
export function buildProductQuestion(product) {
  return `Hola, ADAPTO. Tengo una consulta sobre el producto "${product.name}".`;
}
