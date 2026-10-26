import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import worker from "../apps/api/src/worker.mjs";

const preview = fileURLToPath(new URL("../apps/web/public/index.html", import.meta.url));
const assets = {
  async fetch(request) {
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405 });
    if (!["/", "/index.html"].includes(new URL(request.url).pathname)) return new Response("Not found", { status: 404 });
    const body = await readFile(preview);
    return new Response(request.method === "HEAD" ? null : body, { headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    } });
  },
};
const port = Number(process.env.PORT || 5180);
const server = createServer(async (req, res) => {
  try {
    // Current API has no request bodies or mutations; do not buffer arbitrary input.
    const request = new Request(new URL(req.url, `http://127.0.0.1:${port}`), { method: req.method });
    const response = await worker.fetch(request, { ASSETS: assets });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
    res.end("Local server error");
  }
});
server.listen(port, "127.0.0.1", () => console.log(`DVendo Supply: http://localhost:${port}`));
