export function promoKey(promo) {
  const id = promo.relatedOfferId ?? promo.offerId;
  return id == null ? JSON.stringify(promo) : `offer:${id}`;
}

// Do not assume a short page means the end: DITO may cap pageSize itself.
export async function fetchPromoPages(fetchPage, onProgress = () => {}) {
  const promos = new Map();
  let received = 0;
  for (let pageIndex = 1; pageIndex <= 100; pageIndex++) {
    onProgress(pageIndex);
    let body;
    try {
      body = (await fetchPage(pageIndex)).body;
    } catch (error) {
      return { promos: [...promos.values()], complete: false, warning: error.message };
    }
    const rows = body?.data?.promoList;
    if (!Array.isArray(rows)) {
      return { promos: [...promos.values()], complete: false, warning: "DITO did not return a promo list." };
    }
    const info = body.data.pageInfo || body.pageInfo || {};
    const totalPages = Number(info.totalPage ?? info.totalPages);
    const totalNumber = Number(info.totalNumber);
    const knownEnd = (totalPages > 0 && pageIndex >= totalPages) ||
      (totalNumber > 0 && received + rows.length >= totalNumber);
    if (!rows.length) {
      const missing = (totalNumber > received) || (totalPages > pageIndex);
      return { promos: [...promos.values()], complete: !missing,
        warning: missing ? "DITO returned an empty page before the reported end." : "" };
    }
    const before = promos.size;
    for (const promo of rows) promos.set(promoKey(promo), promo);
    received += rows.length;
    if (promos.size === before) {
      return { promos: [...promos.values()], complete: false,
        warning: "DITO repeated a promo page; further results could not be verified." };
    }
    if (knownEnd) return { promos: [...promos.values()], complete: true, warning: "" };
  }
  return { promos: [...promos.values()], complete: false,
    warning: "Stopped after 100 pages; more promos may be available." };
}

export function mergeCategoryPromos(catalog, promos, category) {
  for (const promo of promos) {
    const key = promoKey(promo);
    const existing = catalog.get(key);
    if (existing) {
      if (!existing.catalogCategories.some((item) => item.code === category.code)) {
        existing.catalogCategories.push(category);
      }
    } else {
      catalog.set(key, { ...promo, catalogCategories: [category] });
    }
  }
}
