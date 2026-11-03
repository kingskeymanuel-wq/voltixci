/* Atelier Dépannage IT — serveur Render
   - sert l'application (public/)
   - sert le moteur de lecture des captures (OCR) depuis node_modules
   - /api/analyze : analyse IA des captures si ANTHROPIC_API_KEY est défini */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 10000;
const KEY = process.env.ANTHROPIC_API_KEY || "";
const GKEY = process.env.GEMINI_API_KEY || "";
const GMODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const ACCESS = process.env.ACCESS_CODE || "";
const LIMIT = Number(process.env.ANALYSES_PER_HOUR || 40);
const PUB = path.join(__dirname, "public");
const NM = path.join(__dirname, "node_modules");

const VENDOR = {
  "/vendor/tesseract/": path.join(NM, "tesseract.js", "dist"),
  "/vendor/xlsx/": path.join(NM, "xlsx", "dist"),
  "/vendor/core/": path.join(NM, "tesseract.js-core"),
  "/vendor/lang/fra.traineddata.gz": path.join(NM, "@tesseract.js-data", "fra", "4.0.0_best_int", "fra.traineddata.gz"),
  "/vendor/lang/eng.traineddata.gz": path.join(NM, "@tesseract.js-data", "eng", "4.0.0_best_int", "eng.traineddata.gz"),
};
const OCR_OK = fs.existsSync(path.join(NM, "tesseract.js", "dist", "tesseract.min.js"));

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".wasm": "application/wasm", ".gz": "application/octet-stream", ".webmanifest": "application/manifest+json",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const SYSTEM = "Tu es un technicien de support informatique bienveillant qui aide des débutants en entreprise " +
  "(Windows, Teams, Outlook, Office, Microsoft Engage / Dynamics 365, centre d'appels Cisco). " +
  "Tu réponds uniquement avec l'objet JSON demandé, en français simple.";

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const h = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  const over = h.length >= LIMIT;
  if (!over) h.push(now);
  hits.set(ip, h);
  return over;
}
function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}
function serveFile(res, file, cache) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return notFound(res);
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
      "Content-Length": st.size,
      "Cache-Control": cache || "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(file).pipe(res);
  });
}
function notFound(res) {
  serveFile(res, path.join(PUB, "index.html"), "no-cache");
}
function inside(base, p) {
  const f = path.normalize(path.join(base, p));
  return f.startsWith(base) ? f : null;
}

async function gemini(body) {
  const parts = [];
  if (body.image && /^image\/(png|jpeg|gif|webp)$/.test(body.mediaType || "")) parts.push({ inline_data: { mime_type: body.mediaType, data: String(body.image) } });
  parts.push({ text: String(body.prompt || "").slice(0, 60000) });
  const payload = JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 2048 } });
  for (const model of [GMODEL, "gemini-flash-lite-latest"]) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "x-goog-api-key": GKEY, "content-type": "application/json" }, body: payload });
    const d = await r.json().catch(() => ({}));
    if (r.ok) return { text: ((d.candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join("") };
    if (r.status === 429) return { error: "rate_limited", status: 429 };
    if (r.status !== 404) return { error: "api", status: 502, detail: d.error && d.error.message };
  }
  return { error: "api", status: 502, detail: "modèle Gemini introuvable" };
}

async function analyze(req, res) {
  if (!KEY && !GKEY) return json(res, 503, { error: "ai_off" });
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 9e6) return json(res, 413, { error: "too_large" });
    chunks.push(c);
  }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return json(res, 400, { error: "bad_json" }); }
  if (ACCESS && body.code !== ACCESS) return json(res, 401, { error: "bad_code" });
  if (limited(ip)) return json(res, 429, { error: "rate_limited" });
  if (!KEY) {
    try { const g = await gemini(body); return g.error ? json(res, g.status || 502, { error: g.error, detail: g.detail }) : json(res, 200, { text: g.text }); }
    catch (e) { return json(res, 502, { error: "network" }); }
  }
  const content = [];
  if (body.image && /^image\/(png|jpeg|gif|webp)$/.test(body.mediaType || "")) {
    content.push({ type: "image", source: { type: "base64", media_type: body.mediaType, data: String(body.image) } });
  }
  content.push({ type: "text", text: String(body.prompt || "").slice(0, 60000) });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: SYSTEM, messages: [{ role: "user", content }] }),
    });
    const d = await r.json();
    if (!r.ok) return json(res, 502, { error: "api", detail: d && d.error && d.error.message });
    const text = (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return json(res, 200, { text });
  } catch (e) {
    return json(res, 502, { error: "network" });
  }
}

http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  const p = decodeURIComponent(u.pathname);
  if (p === "/api/status") return json(res, 200, { ai: !!(KEY || GKEY), engine: KEY ? "claude" : GKEY ? "gemini" : "", code: !!ACCESS, ocr: OCR_OK });
  if (p === "/api/analyze" && req.method === "POST") return analyze(req, res);
  if (p === "/healthz") return json(res, 200, { ok: true });
  for (const [prefix, target] of Object.entries(VENDOR)) {
    if (p === prefix) return serveFile(res, target, "public, max-age=604800, immutable");
    if (prefix.endsWith("/") && p.startsWith(prefix)) {
      const f = inside(target, p.slice(prefix.length));
      return f ? serveFile(res, f, "public, max-age=604800, immutable") : notFound(res);
    }
  }
  const f = inside(PUB, p === "/" ? "index.html" : p);
  if (!f) return notFound(res);
  serveFile(res, f, f.endsWith(".html") ? "no-cache" : undefined);
}).listen(PORT, () => console.log(`Atelier Dépannage IT en ligne sur le port ${PORT} — IA ${KEY ? "Claude" : GKEY ? "Gemini" : "désactivée"}, OCR ${OCR_OK ? "prêt" : "absent"}`));
