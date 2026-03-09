export function formatCurrency(amount: number, currency: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
