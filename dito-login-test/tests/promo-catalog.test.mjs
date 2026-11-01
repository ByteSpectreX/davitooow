import test from "node:test";
import assert from "node:assert/strict";
import { fetchPromoPages, mergeCategoryPromos } from "../public/promo-catalog.mjs";
import { explorePromos, researchCategories } from "../src/promo-research.mjs";

const response = (promoList, pageInfo) => ({ body: { data: { promoList, pageInfo } } });
const offer = (id) => ({ relatedOfferId: id, offerName: `Test promo ${id}` });

test("loads later pages instead of truncating at 50 promos", async () => {
  const pages = [];
  const result = await fetchPromoPages(async (page) => {
    pages.push(page);
    const rows = Array.from({ length: page === 1 ? 50 : 3 }, (_, i) => offer((page - 1) * 50 + i));
    return response(rows, { totalPage: 2, totalNumber: 53 });
  });
  assert.equal(result.complete, true);
  assert.equal(result.promos.length, 53);
  assert.deepEqual(pages, [1, 2]);
});

test("continues short pages when the upstream page size is capped", async () => {
  const pages = [];
  const result = await fetchPromoPages(async (page) => {
    pages.push(page);
    return response(page < 3 ? [offer(page)] : []);
  });
  assert.equal(result.complete, true);
  assert.equal(result.promos.length, 2);
  assert.deepEqual(pages, [1, 2, 3]);
});

test("uses a top-level totalNumber to finish without an extra request", async () => {
  const result = await fetchPromoPages(async (page) => ({
    body: { data: { promoList: [offer(page)] }, pageInfo: { totalNumber: 2 } },
  }));
  assert.equal(result.complete, true);
  assert.equal(result.promos.length, 2);
});

test("stops repeated pages and labels the results incomplete", async () => {
  let calls = 0;
  const result = await fetchPromoPages(async () => {
    calls++;
    return response([offer(1)], { totalPage: 10 });
  });
  assert.equal(calls, 2);
  assert.equal(result.complete, false);
  assert.match(result.warning, /repeated/);
  assert.equal(result.promos.length, 1);
});

test("retains earlier results when a later page fails", async () => {
  const result = await fetchPromoPages(async (page) => {
    if (page === 2) throw new Error("Session expired");
    return response([offer(1)]);
  });
  assert.equal(result.complete, false);
  assert.equal(result.warning, "Session expired");
  assert.equal(result.promos.length, 1);
});

test("does not mistake an upstream error body for an empty catalog", async () => {
  const result = await fetchPromoPages(async () => ({ body: { resultMsg: "Unavailable" } }));
  assert.equal(result.complete, false);
  assert.match(result.warning, /did not return/);
});

test("reports missing results when an empty page arrives before the total", async () => {
  const result = await fetchPromoPages(async (page) => response(page === 1 ? [offer(1)] : [], { totalNumber: 10 }));
  assert.equal(result.complete, false);
  assert.equal(result.promos.length, 1);
});

test("merges offers across categories and retains their filter membership", () => {
  const catalog = new Map();
  const first = { code: "category-a", name: "Category A" };
  const second = { code: "category-b", name: "Category B" };
  mergeCategoryPromos(catalog, [offer(1), offer(2)], first);
  mergeCategoryPromos(catalog, [offer(2), offer(3)], second);
  mergeCategoryPromos(catalog, [offer(2)], second);
  assert.equal(catalog.size, 3);
  assert.deepEqual(catalog.get("offer:2").catalogCategories, [first, second]);
});

test("bounds requests and reports the safety limit", async () => {
  let calls = 0;
  const result = await fetchPromoPages(async (page) => {
    calls++;
    return response([offer(page)]);
  });
  assert.equal(calls, 100);
  assert.equal(result.complete, false);
  assert.match(result.warning, /100 pages/);
});

test("honors DITO pageInfo.total without requesting another page", async () => {
  const pages = [];
  const result = await fetchPromoPages(async (page) => {
    pages.push(page);
    return response([offer(page)], { total: 2 });
  });
  assert.equal(result.complete, true);
  assert.deepEqual(pages, [1, 2]);
});

test("research traverses nested categories, preserves category IDs, and flags malformed trees", () => {
  const result = researchCategories([{ code: "parent", id: 11, subProdCatgList: [
    { code: "child", id: 12, isMCCM: "Y" }, { code: "" },
  ] }]);
  assert.equal(result.invalid, true);
  assert.deepEqual(result.categories.map((c) => [c.code, c.categoryId, c.personalized]),
    [["parent", "11", false], ["child", "12", true]]);
});

test("research compares catalogs without conflating category, offer, and related offer IDs", async () => {
  const calls = [];
  const report = await explorePromos(async (path, method, body) => {
    calls.push({ path, method, body });
    if (path === "shop/catg/list") return { status: 200, body: { prodCatgList: [
      { code: "returned-category", id: 77, subProdCatgList: [{ code: "nested-category", id: 78 }] },
    ] } };
    const rows = path === "offer/promo/list" ? [
      { offerId: 100, relatedOfferId: 200, offerName: "Long Expiry fixture", displaySalesPrice: "799" },
      { offerId: 101, relatedOfferId: 200, offerName: "Different fixture", displaySalesPrice: "799" },
    ] : [{ offerId: 101, relatedOfferId: 200, offerName: "Different fixture", displaySalesPrice: "799" }];
    return { status: 200, body: { data: { promoList: rows, pageInfo: { total: rows.length } } } };
  });
  assert.equal(report.complete, true);
  assert.equal(report.offers.length, 2);
  assert.equal(report.longExpiryMatches.length, 1);
  assert.equal(report.longExpiryMatches[0].subscriberListed, false);
  assert.equal(report.offers.find((o) => o.offerId === "101").subscriberListed, true);
  assert.deepEqual(report.comparison, { webListed: 2, mobileListed: 2, mobileOnly: 0,
    generalOnly: 1, subscriberListed: 1 });
  assert.equal(report.purchaseVerified, false);
  assert.ok(report.offers.every((o) => o.purchaseVerified === false));
  assert.deepEqual(new Set(report.catalogs.map((c) => c.root)),
    new Set(["ECARE_PROMO_WEB_PREPAID", "ECARE_PROMO_PREPAID"]));
  assert.ok(calls.every((c) => c.method === "POST" &&
    ["shop/catg/list", "offer/promo/list", "subs/available/promo/list"].includes(c.path)));
  assert.ok(calls.filter((c) => c.path !== "shop/catg/list").every((c) =>
    ["returned-category", "nested-category"].includes(c.body.catgCodes)));
});

test("research labels missing lists and personalized sources incomplete", async () => {
  const report = await explorePromos(async (path) => path === "shop/catg/list"
    ? { status: 200, body: { prodCatgList: [{ code: "personalized", isMCCM: "Y" }, { code: "ordinary" }] } }
    : { status: 200, body: {} });
  assert.equal(report.complete, false);
  assert.equal(report.offers.length, 0);
  assert.ok(report.warnings.some((w) => /personalized/.test(w)));
  assert.ok(report.warnings.some((w) => /did not return/.test(w)));
});

test("research stops after authentication rejection and enforces a total request budget", async () => {
  let calls = 0;
  const rejected = await explorePromos(async () => { calls++; return { status: 417, body: {} }; });
  assert.equal(calls, 1);
  assert.equal(rejected.complete, false);
  calls = 0;
  const limited = await explorePromos(async (path) => {
    calls++;
    return path === "shop/catg/list" ? { status: 200, body: { prodCatgList: [{ code: "fixture" }] } }
      : response([offer(calls)]);
  }, { maxRequests: 3 });
  assert.equal(calls, 3);
  assert.equal(limited.complete, false);
  assert.match(limited.warnings.join(" "), /limit/);
});

test("research does not include arbitrary account fields in its returned report", async () => {
  const report = await explorePromos(async (path) => path === "shop/catg/list"
    ? { status: 200, body: { prodCatgList: [{ code: "fixture" }] } }
    : { status: 200, body: { data: { promoList: [{ offerId: 50, offerName: "Fixture", privateField: "PRIVATE_FIXTURE" }],
      privateField: "PRIVATE_FIXTURE", pageInfo: { total: 1 } }, privateField: "PRIVATE_FIXTURE" } });
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE_FIXTURE|privateField/);
});
