const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

// 4500 → "$ 4.500"
export function formatPrice(value) {
  return priceFormatter.format(Number(value) || 0).replace(/ /g, " ");
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

// "Motricidad fina" → "motricidad fina" sin tildes, para buscar
export function normalize(text = "") {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
