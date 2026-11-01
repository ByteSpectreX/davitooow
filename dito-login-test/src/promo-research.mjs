import { fetchPromoPages } from "../public/promo-catalog.mjs";

// Roots observed in DITO's frontend and live guest entry response. Never accept
// caller-supplied paths, channel overrides, recipients, or invented offer IDs.
const ROOTS = ["ECARE_PROMO_WEB_PREPAID", "ECARE_PROMO_PREPAID"];
const LISTS = [
  ["available", "subs/available/promo/list"],
  ["general", "offer/promo/list"],
];
const id = (value) => (typeof value !== "number" || Number.isSafeInteger(value)) &&
  /^(?:0|[1-9]\d{0,15})$/.test(String(value ?? "")) ? String(value) : null;
const label = (value) => typeof value === "string" || typeof value === "number"
  ? String(value).replace(/<[^>]*>/g, "").slice(0, 500) : "";

export function researchCategories(rows) {
  const categories = new Map();
  let invalid = false;
  const walk = (items, depth = 0) => {
    if (depth > 8 || !Array.isArray(items)) { invalid = true; return; }
    for (const row of items) {
      if (!row || typeof row.code !== "string" || !row.code || row.code.length > 80) { invalid = true; continue; }
      if (categories.size >= 100 && !categories.has(row.code)) { invalid = true; continue; }
      const previous = categories.get(row.code);
      categories.set(row.code, { code: row.code, name: label(row.name || row.code),
        categoryId: id(row.id), personalized: previous?.personalized || row.isMCCM === "Y" });
      if (row.subProdCatgList != null) walk(row.subProdCatgList, depth + 1);
    }
  };
  walk(rows);
  return { categories: [...categories.values()], invalid };
}

export async function explorePromos(call, { maxRequests = 80 } = {}) {
  const warnings = [];
  const catalogs = [];
  const offers = new Map();
  let requests = 0;
  let stopped = false;
  const query = async (path, body) => {
    if (requests >= maxRequests) throw new Error("Request limit reached; comparison is incomplete.");
    requests++;
    let result;
    try { result = await call(path, "POST", body); }
    catch { throw new Error("Catalog request failed; no offers verified from this page."); }
    if (result.status < 200 || result.status >= 300 || result.body?.loginSuccess === false) {
      if ([401, 403, 417].includes(result.status)) stopped = true;
      throw new Error(`Catalog query rejected (HTTP ${Number(result.status) || 0}).`);
    }
    return result;
  };

  for (const root of ROOTS) {
    if (stopped || requests >= maxRequests) break;
    let tree;
    try {
      const response = await query("shop/catg/list", { parentCatgCode: root });
      const body = response.body?.data ?? response.body;
      tree = researchCategories(body?.prodCatgList);
      if (tree.invalid) warnings.push(`${root}: category response incomplete or malformed.`);
    } catch (error) { warnings.push(`${root}: ${error.message}`); continue; }
    for (const category of tree.categories) {
      if (category.personalized) {
        warnings.push(`${root}/${category.code}: personalized catalog needs its separate supported flow.`);
        continue;
      }
      for (const [kind, path] of LISTS) {
        if (stopped || requests >= maxRequests) break;
        const source = { root, category: category.code, categoryName: category.name,
          categoryId: category.categoryId, kind };
        const result = await fetchPromoPages(async (page) => {
          const response = await query(path, { catgCodes: category.code,
            pageInfo: { currentPage: page, pageSize: 50 } });
          const data = response.body?.data ?? response.body;
          return { body: { data } };
        }, () => {}, (row) => JSON.stringify([id(row.offerId), id(row.relatedOfferId)]));
        catalogs.push({ ...source, count: result.promos.length, complete: result.complete });
        if (!result.complete) warnings.push(`${root}/${category.code}/${kind}: ${result.warning}`);
        for (const row of result.promos) {
          const offerId = id(row.offerId);
          const relatedOfferId = id(row.relatedOfferId);
          if (!offerId && !relatedOfferId) {
            warnings.push(`${root}/${category.code}: an offer had no usable public ID.`);
            continue;
          }
          // Preserve both identifiers: neither is a substitute for the other.
          const observation = { ...source, name: label(row.offerName),
            price: label(row.displaySalesPrice ?? row.salesPrice),
            validity: label(row.validityPeriod), validityUnit: label(row.validityPeriodUnit),
            brief: label(row.brief) };
          const key = JSON.stringify([offerId, relatedOfferId]);
          const offer = offers.get(key) || { offerId, relatedOfferId, observations: [],
            subscriberListed: false, purchaseVerified: false };
          offer.observations.push(observation);
          offer.subscriberListed ||= kind === "available";
          offers.set(key, offer);
        }
      }
    }
  }
  if (requests >= maxRequests) warnings.push("Request limit reached; comparison may be incomplete.");
  const rows = [...offers.values()];
  const fromRoot = (row, root) => row.observations.some((o) => o.root === root);
  const comparison = {
    webListed: rows.filter((row) => fromRoot(row, ROOTS[0])).length,
    mobileListed: rows.filter((row) => fromRoot(row, ROOTS[1])).length,
    mobileOnly: rows.filter((row) => fromRoot(row, ROOTS[1]) && !fromRoot(row, ROOTS[0])).length,
    generalOnly: rows.filter((row) => !row.subscriberListed).length,
    subscriberListed: rows.filter((row) => row.subscriberListed).length,
  };
  return { requests, complete: warnings.length === 0, warnings: [...new Set(warnings)], catalogs,
    offers: rows, comparison, longExpiryMatches: rows.filter((row) => row.observations.some((o) => /long\s*expiry/i.test(o.name))),
    purchaseVerified: false };
}
