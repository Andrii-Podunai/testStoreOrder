export function extractPrice(priceString: string | null): number | null {
  if (priceString === null) {
    return null;
  }
  const match = priceString.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, "")) : null;
}

export function summaryPrice(productPrice: number, addonPrice: number): number {
  const total = productPrice + addonPrice;
  return Math.round(total * 100) / 100;
}

