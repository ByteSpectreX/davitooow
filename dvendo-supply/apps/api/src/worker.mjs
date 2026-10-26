// Public foundation endpoints only. No account data or DITO network calls.
function json(status, body, extra = {}) {
  return Response.json(body, { status, headers: {
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra,
  } });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/v1/health" || pathname === "/api/v1/capabilities") {
      if (request.method !== "GET") {
        return json(405, { error: { code: "METHOD_NOT_ALLOWED", message: "Use GET." } }, { Allow: "GET" });
      }
      if (pathname === "/api/v1/health") {
        return json(200, { status: "ok", service: "dvendo-supply", stage: "foundation" });
      }
      return json(200, {
        stage: "foundation", preview: "synthetic", authentication: false,
        persistentPlans: false, providerConnected: false, livePurchases: false, automaticRenewals: false,
      });
    }
    // Unknown API routes must never fall through to an HTML asset or report success.
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return json(404, { error: { code: "NOT_FOUND", message: "This API route is not implemented." } });
    }
    return env.ASSETS.fetch(request);
  },
};
