import test from "node:test";
import assert from "node:assert/strict";
import { fetchPromoPages, mergeCategoryPromos } from "../public/promo-catalog.mjs";

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
