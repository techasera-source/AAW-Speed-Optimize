import prisma from "../db.server";

const ALLOWED_METRICS = new Set(["LCP", "INP", "CLS"]);

// CORS: storefronts live on the shop's own domain, not the app's domain,
// so the browser beacon needs explicit cross-origin permission to POST here.
function withCors(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }

  if (request.method !== "POST") {
    return withCors(new Response("Method not allowed", { status: 405 }));
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return withCors(new Response("Invalid JSON", { status: 400 }));
  }

  const { shop, metric, value, path, deviceType } = payload || {};

  if (
    typeof shop !== "string" ||
    !shop.endsWith(".myshopify.com") ||
    !ALLOWED_METRICS.has(metric) ||
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    typeof path !== "string"
  ) {
    return withCors(new Response("Invalid payload", { status: 400 }));
  }

  // Defensive clamps: a single malformed beacon shouldn't skew aggregates.
  const clampedValue = Math.max(0, Math.min(value, metric === "CLS" ? 10 : 60000));

  await prisma.vitalSample.create({
    data: {
      shop,
      metric,
      value: clampedValue,
      path: path.slice(0, 500),
      deviceType: typeof deviceType === "string" ? deviceType.slice(0, 20) : "unknown",
    },
  });

  return withCors(new Response(null, { status: 204 }));
}

export async function loader() {
  return withCors(new Response("Method not allowed", { status: 405 }));
}
