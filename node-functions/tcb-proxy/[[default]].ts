/**
 * CloudBase API reverse proxy.
 *
 * Forwards all requests to CloudBase gateway, bypassing CORS restrictions
 * for the free-tier plan that can't add custom domains.
 *
 * Route: /tcb-proxy/*
 * Target: https://{envId}.api.tcloudbasegateway.com/*
 */

const TARGET_BASE = "https://tsync-d3g3w7jmab93b9b25.api.tcloudbasegateway.com";

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
  params: Record<string, string[]>;
}) {
  const { request, params } = context;

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Build target URL from catch-all params
  const routePath = (params.default ?? []).join("/");
  const targetUrl = TARGET_BASE + "/" + routePath + new URL(request.url).search;

  try {
    // Forward headers (strip browser-specific ones)
    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== "host" && lower !== "origin" && lower !== "referer") {
        forwardHeaders.set(key, value);
      }
    });

    // Read body as raw bytes (works for GET too if there's no body)
    let body: ArrayBuffer | null = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        body = await request.arrayBuffer();
      } catch {
        // no body
      }
    }

    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: body && body.byteLength > 0 ? body : undefined,
    });

    // Return proxy response with CORS headers
    const respHeaders = new Headers(proxyResponse.headers);
    respHeaders.set("Access-Control-Allow-Origin", "*");
    respHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    respHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: respHeaders,
    });
  } catch (e: any) {
    console.error("[TCB Proxy] Error:", e.message || e);
    return new Response(
      JSON.stringify({ error: "Proxy error", detail: String(e.message || e) }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
